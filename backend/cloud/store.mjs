/** REST adapter only: SQL owns transactions, quotas, deduplication and leases. */
export function cloudStore(config, fetcher = fetch) {
  return async function rpc(name, args) {
    const response = await fetcher(`${config.databaseUrl}/rest/v1/rpc/ea_${name}`, {
      method: 'POST', headers: { apikey: config.databaseKey, 'Content-Type': 'application/json',
        ...(!config.databaseKey.startsWith('sb_secret_') ? { Authorization: `Bearer ${config.databaseKey}` } : {}) },
      body: JSON.stringify(args), signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw Object.assign(new Error('Falha no banco'), { status: detail.message === 'rate_limited' ? 429 : 503 });
    }
    return response.json();
  };
}
