import { CronJob } from 'cron';
import { prisma } from '../db.js';
import { orUpsertSchedule } from '../services/orClient.js';

export const dispatcher = new CronJob('*/60 * * * * *', async () => {
  if (process.env.OR_PUSH_ENABLED !== 'true') return;
  const now = new Date();
  const within = new Date(now.getTime() + 10*60*1000); // próximos 10 min

  const events = await prisma.event.findMany({
    where: {
      status: 'confirmed',
      startsAt: { lte: within },
      endsAt: { gte: now },
    },
    include: { room: true },
  });

  for (const e of events) {
    if (!e.room.openremoteAssetId) continue;
    try {
      await orUpsertSchedule({
        scheduleId: e.id,
        assetId: e.room.openremoteAssetId!,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        timezone: e.timezone,
        actions: [
          { at: new Date(e.startsAt.getTime() - 5*60*1000).toISOString(), command: { attribute: 'power', value: true }},
          { at: e.endsAt.toISOString(),                               command: { attribute: 'power', value: false }},
        ],
      });
    } catch (err) {
      console.error('[dispatcher]', err);
    }
  }
});