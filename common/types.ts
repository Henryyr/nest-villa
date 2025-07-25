export interface FindAllOptions {
  search?: string;
  page?: number;
  limit?: number;
} 

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
