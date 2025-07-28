export interface SessionData {
    userId: string;
    email: string;
    role: string;
    lastActivity: number;
    ipAddress?: string;
    userAgent?: string;
  }