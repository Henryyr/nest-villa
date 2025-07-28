// Queue Job Types
export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  template?: string;
  variables?: Record<string, unknown>;
}

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export interface PropertyJobData {
  propertyId: string;
  action: 'create' | 'update' | 'delete' | 'index' | 'process-images';
  data?: Record<string, unknown>;
}

export interface UserJobData {
  userId: string;
  action: 'welcome' | 'profile-update' | 'account-deletion';
  data?: Record<string, unknown>;
}

export interface SearchJobData {
  query: string;
  filters?: Record<string, unknown>;
  userId?: string;
}

export interface FileJobData {
  fileId: string;
  action: 'upload' | 'process' | 'delete';
  data?: Record<string, unknown>;
}

export interface MessageJobData {
  type: 'ephemeral-message' | 'persistent-message' | 'notification';
  to: string;
  from: string;
  content: string;
  propertyId?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Queue Options
export interface QueueJobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete?: number;
  removeOnFail?: number;
}

// Queue Statistics
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

// Job Status Types
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused'; 