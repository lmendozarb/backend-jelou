import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'internal-token';

export interface AuthRequest extends Request {
  user?: { sub: string; email: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { sub: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function internalServiceAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.slice(7);
  if (token !== SERVICE_TOKEN) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}
