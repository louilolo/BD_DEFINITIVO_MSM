import fetch from 'node-fetch';

const BASE = process.env.OR_API_BASE_URL!;
const API_KEY = process.env.OR_API_KEY;

function headers(extra: Record<string,string> = {}) {
  return {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
    ...extra,
  };
}

export type ORSchedulePayload = {
  scheduleId: string;                 // usamos o id do Event para idempotência
  assetId: string;                    // rooms.openremote_asset_id
  startsAt: string;                   // ISO
  endsAt: string;                     // ISO
  timezone?: string;                  // ex: 'America/Belem'
  actions: Array<{
    at: string;                       // ISO — quando executar
    command: { attribute: string; value: any };
  }>;
};

export async function orUpsertSchedule(payload: ORSchedulePayload) {
  const res = await fetch(`${BASE}/schedules`, {
    method: 'PUT', // idempotente: PUT cria/atualiza pelo scheduleId
    headers: headers({ 'Idempotency-Key': payload.scheduleId }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`[OR] upsert schedule failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function orDeleteSchedule(scheduleId: string) {
  const res = await fetch(`${BASE}/schedules/${encodeURIComponent(scheduleId)}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok && res.status !== 404) throw new Error(`[OR] delete schedule failed: ${res.status} ${await res.text()}`);
}