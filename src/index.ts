import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { roomsRouter } from './routes/rooms.js';
import { eventsRouter } from './routes/events.js';
import { dispatcher } from './jobs/dispatcher.js';
const app = express();
app.use(cors());                // em prod você pode restringir com: cors({ origin: ['https://seuapp.com'] })
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/rooms', roomsRouter);
app.use('/events', eventsRouter);

dispatcher.start();

const port = Number(process.env.PORT || 4000);
app.listen(port, '0.0.0.0', () => console.log(`API on :${port}`));
