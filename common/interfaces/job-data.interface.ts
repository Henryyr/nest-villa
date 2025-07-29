// Email job data
export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

// Message job data
export interface EphemeralMessageJob {
  to: string;
  from: string;
  content: string;
  propertyId?: string;
  timestamp: number;
}

// JWT payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}