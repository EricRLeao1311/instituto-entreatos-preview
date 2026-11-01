/** A lease coordinates workers; the provider key covers ambiguous network outcomes. */
export async function deliver(rpc, config, id = null, fetcher = fetch) {
  if (config.mode !== 'send') return { email: 'captured' };
  const rows = await rpc('claim', { p_id: id, p_limit: id ? 1 : 5 });
  if (!rows.length) return { email: 'pending' };
  let sent = 0;
  for (const row of rows) {
    let status = 'pending', providerId = null, errorCode = null;
    try {
      if (!config.allowed.has(row.mail.to?.toLowerCase())) {
        status = 'review'; errorCode = 'recipient_not_allowed';
      } else {
        const response = await fetcher('https://api.resend.com/emails', {
          method: 'POST', headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ea-preview/${row.id}` },
          body: JSON.stringify({ from: config.from, to: [row.mail.to], subject: row.mail.subject, text: row.mail.text, ...(row.mail.reply_to ? { reply_to: row.mail.reply_to } : {}) }),
          signal: AbortSignal.timeout(4000),
        });
        const result = await response.json().catch(() => null);
        if (response.ok && typeof result?.id === 'string') { status = 'sent'; providerId = result.id; }
        else { errorCode = `provider_${response.status}`; if (response.status >= 400 && response.status < 500 && ![408,409,429].includes(response.status)) status = 'failed'; }
      }
    } catch { errorCode = 'provider_unavailable'; }
    // Never expose raw provider errors or recipients to the public API/logs.
    const finished = await rpc('finish', { p_id: row.id, p_token: row.lease_token, p_status: status, p_provider_id: providerId, p_error: errorCode });
    if (status === 'sent' && finished) sent++;
  }
  return { email: sent ? 'accepted' : 'pending', processed: rows.length, accepted: sent };
}
