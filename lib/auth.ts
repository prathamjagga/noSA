import jwt from "jsonwebtoken";

const JWT_SECRET = "your-secret-key"; // In production, use environment variable

export function getTokenData(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
    };
  } catch {
    return null;
  }
}
