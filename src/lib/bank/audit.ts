export function auditLog(event: string, payload: Record<string, unknown>) {
  const requestId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      requestId,
      event,
      ...payload,
    }),
  );

  return requestId;
}
