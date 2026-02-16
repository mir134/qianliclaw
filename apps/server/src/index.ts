import express from 'express';
import cors from 'cors';
import { setConfigRootOverride } from './services/configService.js';
import { readSettings } from './services/settingsService.js';
import { configRouter } from './routes/config.js';
import { workspaceRouter } from './routes/workspace.js';
import { statusRouter } from './routes/status.js';
import { settingsRouter } from './routes/settings.js';

const app = express();
const PORT = process.env.PORT ?? 3840;

const s = readSettings();
if (s.configRootOverride) setConfigRootOverride(s.configRootOverride);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/config', configRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/status', statusRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`qianliclaw server http://127.0.0.1:${PORT}`);
});
