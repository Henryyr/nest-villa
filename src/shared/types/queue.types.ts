export interface QueueJob {
  id: string;
  name: string;
  data: Record<string, unknown>;
  options?: QueueJobOptions;
}

export interface QueueJobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: string;
    delay: number;
  };
}

export interface QueueResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  body: string;
  context?: Record<string, unknown>;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface PropertyJobData {
  propertyId: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface UserJobData {
  userId: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface SearchJobData {
  query: string;
  filters?: Record<string, unknown>;
  userId?: string;
}

export interface FileJobData {
  fileId: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface MessageJobData {
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused'; 