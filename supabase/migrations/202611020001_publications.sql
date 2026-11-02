-- Additive migration for the preview project. Does not grant public list access.
begin;
alter table public.ea_submissions drop constraint ea_submissions_payload_check;
alter table public.ea_submissions add constraint ea_submissions_payload_check check(payload->>'kind' in ('contact','research','publications'));
create table public.ea_audience (
  email text primary key, name text not null, sources text[] not null,
  subscribed boolean not null, consent jsonb, token_hash text not null,
  updated_at timestamptz not null default now(), unsubscribed_at timestamptz
);
create unique index ea_audience_token on public.ea_audience(token_hash);
create table public.ea_audience_events (
  id uuid primary key default gen_random_uuid(), email text not null,
  source text not null, opted_in boolean not null, consent jsonb,
  created_at timestamptz not null default now()
);
alter table public.ea_audience enable row level security;
alter table public.ea_audience_events enable row level security;
revoke all on public.ea_audience,public.ea_audience_events from public,anon,authenticated;
grant select,delete on public.ea_audience,public.ea_audience_events to service_role;

create function public.ea_capture_audience() returns trigger language plpgsql security definer set search_path='' as $$
declare p jsonb:=new.payload; wants boolean;
begin
  if p->>'kind' not in ('research','publications') then return new; end if;
  wants:=coalesce((p->>'updatesOptIn')::boolean,false);
  insert into public.ea_audience(email,name,sources,subscribed,consent,token_hash)
    values(p->>'email',p->>'name',array[p->>'source'],wants,p->'updatesConsent',p->>'unsubscribeTokenHash')
    on conflict(email) do update set name=excluded.name,
      sources=array(select distinct unnest(ea_audience.sources || excluded.sources)),
      subscribed=ea_audience.subscribed or excluded.subscribed,
      consent=case when excluded.subscribed then excluded.consent else ea_audience.consent end,
      token_hash=excluded.token_hash,updated_at=now(),
      unsubscribed_at=case when excluded.subscribed then null else ea_audience.unsubscribed_at end;
  insert into public.ea_audience_events(email,source,opted_in,consent)
    values(p->>'email',p->>'source',wants,p->'updatesConsent');
  return new;
end;
$$;
revoke all on function public.ea_capture_audience() from public,anon,authenticated;
create trigger ea_submission_audience after insert on public.ea_submissions for each row execute function public.ea_capture_audience();

create or replace function public.ea_submit(p_payload jsonb, p_mail jsonb, p_fingerprint text, p_client text, p_email text, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / 600) * 600);
  v_count integer; v_id uuid; v_out uuid; v_status text;
begin
  if p_mode not in ('captured','pending') or p_payload->>'kind' not in ('contact','research','publications')
    or p_fingerprint !~ '^[0-9a-f]{64}$' or p_client !~ '^[0-9a-f]{64}$' or p_email !~ '^[0-9a-f]{64}$'
    then raise exception 'invalid_submission'; end if;
  -- Same fingerprint is serialized even across cold starts / separate function instances.
  perform pg_advisory_xact_lock(hashtextextended(p_fingerprint, 0));
  delete from public.ea_rate_limits where bucket < now() - interval '1 day';
  insert into public.ea_rate_limits values (v_bucket, 'ip:' || p_client, 1)
    on conflict(bucket,client_hash) do update set requests=ea_rate_limits.requests+1 returning requests into v_count;
  if v_count > 10 then raise exception 'rate_limited'; end if;
  insert into public.ea_rate_limits values (v_bucket, 'email:' || p_email, 1)
    on conflict(bucket,client_hash) do update set requests=ea_rate_limits.requests+1 returning requests into v_count;
  if v_count > 5 then raise exception 'rate_limited'; end if;
  select s.id, o.id, o.status into v_id, v_out, v_status
    from public.ea_submissions s join public.ea_outbox o on o.submission_id=s.id
    where s.fingerprint=p_fingerprint and s.created_at >= now() - interval '10 minutes'
    order by s.created_at desc limit 1;
  if found and not (coalesce((p_payload->>'updatesOptIn')::boolean,false) and exists(select 1 from public.ea_audience where email=p_payload->>'email' and not subscribed)) then return jsonb_build_object('id',v_id,'outbox_id',v_out,'duplicate',true,'email',v_status); end if;
  insert into public.ea_submissions(fingerprint,payload) values (p_fingerprint,p_payload) returning id into v_id;
  insert into public.ea_outbox(submission_id,mail,status) values(v_id,p_mail,p_mode) returning id into v_out;
  return jsonb_build_object('id',v_id,'outbox_id',v_out,'duplicate',false,'email',p_mode);
end;
$$;


create function public.ea_unsubscribe(p_token_hash text,p_client text) returns boolean
language plpgsql security definer set search_path='' as $$
declare v_count integer; v_bucket timestamptz:=to_timestamp(floor(extract(epoch from now())/600)*600);
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' or p_client !~ '^[0-9a-f]{64}$' then raise exception 'invalid_token'; end if;
  insert into public.ea_rate_limits values(v_bucket,'unsubscribe:'||p_client,1)
    on conflict(bucket,client_hash) do update set requests=ea_rate_limits.requests+1 returning requests into v_count;
  if v_count>20 then raise exception 'rate_limited'; end if;
  insert into public.ea_audience_events(email,source,opted_in)
    select email,'unsubscribe',false from public.ea_audience where token_hash=p_token_hash and subscribed;
  update public.ea_audience set subscribed=false,unsubscribed_at=now(),updated_at=now() where token_hash=p_token_hash;
  update public.ea_outbox set status='review',error_code='subscription_cancelled'
    where status='pending' and mail->>'category'='publications'
      and mail->>'to' in (select email from public.ea_audience where token_hash=p_token_hash);
  return true;
end;
$$;
revoke all on function public.ea_unsubscribe(text,text) from public,anon,authenticated;
grant execute on function public.ea_unsubscribe(text,text) to service_role;
commit;
