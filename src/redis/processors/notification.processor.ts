import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PubSubService } from '../pubsub.service';
import { CacheService } from '../cache.service';

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: string[];
}

@Processor('notification')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly pubSubService: PubSubService,
    private readonly cacheService: CacheService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.log(`Processing notification job: ${job.id}`);
    
    try {
      const { userId, type, title, message, data, channels } = job.data;

      // Send real-time notification via pub/sub
      await this.pubSubService.publishUserNotification(userId, {
        type,
        title,
        message,
        data,
        timestamp: Date.now(),
      });

      // Store notification in cache for offline users
      await this.storeNotification(userId, {
        id: job.id,
        type,
        title,
        message,
        data,
        timestamp: Date.now(),
        read: false,
      });

      // Send to specific channels if provided
      if (channels && channels.length > 0) {
        await this.pubSubService.broadcast(channels, {
          userId,
          type,
          title,
          message,
          data,
          timestamp: Date.now(),
        });
      }

      this.logger.log(`Notification sent successfully for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error processing notification job: ${error}`);
      throw error;
    }
  }

  private async storeNotification(userId: string, notification: unknown): Promise<void> {
    const key = `notifications:${userId}`;
    const cached = await this.cacheService.get(key);
    const notifications = Array.isArray(cached) ? cached : [];
    notifications.unshift(notification as Record<string, unknown>);
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }
    
    await this.cacheService.set(key, notifications, 86400 * 30); // 30 days
  }
} 