import { Router, Request, Response } from 'express';
import { readConfig, writeConfig } from '../services/configService.js';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  const { config, configPath, error } = readConfig();
  if (error) {
    res.status(500).json({ error, configPath, config: null });
    return;
  }
  res.json({ config, configPath });
});

configRouter.put('/', (req: Request, res: Response) => {
  const config = req.body;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    res.status(400).json({ error: 'Body must be a JSON object' });
    return;
  }
  const err = writeConfig(config);
  if (err) {
    res.status(500).json({ error: err });
    return;
  }
  res.json({ ok: true });
});

configRouter.get('/schema', (_req: Request, res: Response) => {
  res.json({
    sections: [
      { key: 'gateway', label: '网关', fields: ['port', 'reload'] },
      { key: 'agents', label: '智能体', fields: ['defaults', 'list', 'bindings'] },
      { key: 'channels', label: '渠道', fields: ['whatsapp', 'telegram', 'discord'] },
      { key: 'session', label: '会话', fields: ['dmScope', 'reset'] },
      { key: 'tools', label: '工具与自动化', fields: ['tools', 'cron', 'hooks'] },
    ],
  });
});
