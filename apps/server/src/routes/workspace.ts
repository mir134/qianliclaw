import { Router, Request, Response } from 'express';
import {
  listWorkspaceFiles,
  readWorkspaceFile,
  writeWorkspaceFile,
} from '../services/workspaceService.js';

export const workspaceRouter = Router();

workspaceRouter.get('/files', (_req: Request, res: Response) => {
  const result = listWorkspaceFiles();
  res.json(result);
});

workspaceRouter.get('/files/:name', (req: Request, res: Response) => {
  const { name } = req.params;
  const { content, error } = readWorkspaceFile(name);
  if (error) {
    res.status(error === 'Invalid file name' ? 400 : 500).json({ error, content: null });
    return;
  }
  res.json({ content, name });
});

workspaceRouter.put('/files/:name', (req: Request, res: Response) => {
  const { name } = req.params;
  const content = typeof req.body?.content === 'string' ? req.body.content : '';
  const err = writeWorkspaceFile(name, content);
  if (err) {
    const status = err === 'Invalid file name' ? 400 : 500;
    res.status(status).json({ error: err });
    return;
  }
  res.json({ ok: true });
});
