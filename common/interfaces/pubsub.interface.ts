export interface PubSubMessage {
    channel: string;
    message: Record<string, unknown>;
    timestamp: number;
    publisher?: string;
  }
  
  export interface SubscriptionCallback {
    (message: PubSubMessage): void;
  }