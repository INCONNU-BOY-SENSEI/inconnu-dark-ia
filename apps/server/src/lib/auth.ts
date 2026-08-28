import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface InconnuJwtPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
}

export function inconnuSignToken(payload: InconnuJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function inconnuVerifyToken(token: string): InconnuJwtPayload {
  return jwt.verify(token, JWT_SECRET) as InconnuJwtPayload;
}

export function inconnuHashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function inconnuComparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
