import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const COOKIE_NAME = "next-auth.session-token"; // local cookie name
const SECURE_COOKIE_NAME = "__Secure-next-auth.session-token"; // production cookie name

interface DecodedUser extends JwtPayload {
  name?: string;
  email?: string;
  role?: "ADMIN" | "INVESTOR";
  sub?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedUser;
  }
}

export const verifySession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const token =
    req.cookies[COOKIE_NAME] || req.cookies[SECURE_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "No session cookie found" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.AUTH_SECRET as string
    ) as DecodedUser;

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify failed:", (err as Error).message);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
  
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "ADMIN") {

    return res.status(403).json({ error: "Admin role required" });
  }

  next();
};

export const requireInvestor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "INVESTOR" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Investor role required" });
  }

  next();
};
