import { Router, Request, Response } from 'express';
import { getStatus, runOpenClawHealth } from '../services/statusService.js';

export const statusRouter = Router();

statusRouter.get('/', (_req: Request, res: Response) => {
  const status = getStatus();
  res.json(status);
});

statusRouter.post('/health', async (req: Request, res: Response) => {
  const cliPath = (req.body && req.body.openclawCliPath) ?? null;
  const result = runOpenClawHealth(cliPath);
  res.json(result);
});
