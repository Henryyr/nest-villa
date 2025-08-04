export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface EphemeralMessageJob {
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
  expiresAt: Date;
}

export interface UserJob {
  userId: string;
  action: string;
  data?: Record<string, unknown>;
} 