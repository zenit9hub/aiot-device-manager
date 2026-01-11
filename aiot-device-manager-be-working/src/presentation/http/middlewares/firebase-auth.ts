import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedUser } from '../../../domain/entities/user';
import { firebaseAuth } from '../../../config/firebase';
import { logger } from '../../../shared/logger';

declare module 'express-serve-static-core' {
  // augment Request with user info after Firebase verification
  interface Request {
    authUser?: AuthenticatedUser;
  }
}

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Bearer token' });
  }

  const idToken = authorization.replace('Bearer ', '').trim();

  try {
    const decoded = await firebaseAuth().verifyIdToken(idToken, true);
    req.authUser = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name
    };
    return next();
  } catch (error) {
    logger.warn({ err: error }, 'Failed to verify Firebase token');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
