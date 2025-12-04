// types/express.d.ts
import { RequestUser } from '../middleware/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export {};