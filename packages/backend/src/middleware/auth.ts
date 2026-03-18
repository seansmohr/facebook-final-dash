import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const password = Buffer.from(token, 'base64').toString('utf-8');
  const correct = process.env.DASHBOARD_PASSWORD || 'mohr2026';

  if (password === correct) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
}
