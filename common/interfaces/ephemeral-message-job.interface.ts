export interface EphemeralMessageJob {
  to: string;
  from: string;
  content: string;
  propertyId?: string;
  timestamp: number;
} 