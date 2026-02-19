import { Router, Request, Response } from 'express';
import {
  readSettings,
  writeSettings,
  AppSettings,
} from '../services/settingsService.js';
import { setConfigRootOverride } from '../services/configService.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req: Request, res: Response) => {
  res.json(readSettings());
});

settingsRouter.put('/', (req: Request, res: Response) => {
  const body = req.body as Partial<AppSettings>;
  const current = readSettings();
  const next: AppSettings = {
    configRootOverride:
      body.configRootOverride !== undefined
        ? body.configRootOverride
        : current.configRootOverride,
    workspacePathOverride:
      body.workspacePathOverride !== undefined
        ? body.workspacePathOverride
        : current.workspacePathOverride,
    openclawCliPath:
      body.openclawCliPath !== undefined
        ? body.openclawCliPath
        : current.openclawCliPath,
    gatewayUrl:
      body.gatewayUrl !== undefined ? body.gatewayUrl : current.gatewayUrl,
  };
  const err = writeSettings(next);
  if (err) {
    res.status(500).json({ error: err });
    return;
  }
  if (next.configRootOverride !== undefined)
    setConfigRootOverride(next.configRootOverride ?? null);
  res.json({ ok: true, settings: next });
});
