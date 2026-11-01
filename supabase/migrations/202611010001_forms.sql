-- Apply ONLY to a new, isolated preview project. Never to Webflow or a production DB.
begin;

create table public.ea_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fingerprint text not null,
  payload jsonb not null check (payload->>'kind' in ('contact','research'))
);
create index ea_submission_retry on public.ea_submissions(fingerprint, created_at);
create table public.ea_outbox (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.ea_submissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  mail jsonb not null,
  status text not null check (status in ('captured','pending','sending','sent','failed','review')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  lease_token uuid, lease_until timestamptz,
  provider_id text, error_code text
);
create index ea_outbox_due on public.ea_outbox(status, available_at);
create table public.ea_rate_limits (
  bucket timestamptz not null, client_hash text not null, requests integer not null,
  primary key(bucket, client_hash)
);

alter table public.ea_submissions enable row level security;
alter table public.ea_outbox enable row level security;
alter table public.ea_rate_limits enable row level security;
revoke all on public.ea_submissions, public.ea_outbox, public.ea_rate_limits from public, anon, authenticated;

create function public.ea_submit(p_payload jsonb, p_mail jsonb, p_fingerprint text, p_client text, p_email text, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / 600) * 600);
  v_count integer; v_id uuid; v_out uuid; v_status text;
begin
  if p_mode not in ('captured','pending') or p_payload->>'kind' not in ('contact','research')
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
  if found then return jsonb_build_object('id',v_id,'outbox_id',v_out,'duplicate',true,'email',v_status); end if;
  insert into public.ea_submissions(fingerprint,payload) values (p_fingerprint,p_payload) returning id into v_id;
  insert into public.ea_outbox(submission_id,mail,status) values(v_id,p_mail,p_mode) returning id into v_out;
  return jsonb_build_object('id',v_id,'outbox_id',v_out,'duplicate',false,'email',p_mode);
end;
$$;

create function public.ea_claim(p_id uuid default null, p_limit integer default 5)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  -- Provider deduplication lasts 24h. Ambiguous old deliveries need review, not blind retry.
  update public.ea_outbox set status='review', error_code='idempotency_window_expired', lease_token=null, lease_until=null
    where status in ('pending','sending') and first_attempt_at < now()-interval '23 hours'
      and (lease_until is null or lease_until < now());
  with candidates as (
    select id from public.ea_outbox
      where (p_id is null or id=p_id) and attempts<5 and available_at<=now()
        and (status='pending' or (status='sending' and lease_until<now()))
      order by created_at for update skip locked limit greatest(1,least(p_limit,5))
  ), claimed as (
    update public.ea_outbox o set status='sending', attempts=o.attempts+1,
      lease_token=gen_random_uuid(), lease_until=now()+interval '2 minutes',
      first_attempt_at=coalesce(o.first_attempt_at,now())
      from candidates c where o.id=c.id returning o.id,o.mail,o.lease_token
  ) select coalesce(jsonb_agg(to_jsonb(claimed)), '[]'::jsonb) into v_result from claimed;
  return v_result;
end;
$$;

create function public.ea_finish(p_id uuid, p_token uuid, p_status text, p_provider_id text default null, p_error text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if p_status not in ('sent','pending','failed','review') then raise exception 'invalid_status'; end if;
  update public.ea_outbox set
    status=case when p_status='pending' and attempts>=5 then 'failed' else p_status end,
    available_at=now()+interval '5 minutes'*power(2,least(attempts,5)),
    provider_id=left(p_provider_id,200), error_code=left(p_error,60), lease_token=null, lease_until=null
    where id=p_id and status='sending' and lease_token=p_token and lease_until>now();
  get diagnostics v_count=row_count;
  return v_count=1;
end;
$$;

revoke all on function public.ea_submit(jsonb,jsonb,text,text,text,text) from public, anon, authenticated;
revoke all on function public.ea_claim(uuid,integer) from public, anon, authenticated;
revoke all on function public.ea_finish(uuid,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.ea_submit(jsonb,jsonb,text,text,text,text) to service_role;
grant execute on function public.ea_claim(uuid,integer) to service_role;
grant execute on function public.ea_finish(uuid,uuid,text,text,text) to service_role;
grant select, delete on public.ea_submissions, public.ea_outbox to service_role;

commit;
