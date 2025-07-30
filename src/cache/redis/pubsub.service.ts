import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Logger } from '@nestjs/common';
import { PubSubMessage, SubscriptionCallback } from '../../shared/interfaces/redis.interface';

@Injectable()
export class PubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private subscriptions = new Map<string, SubscriptionCallback[]>();
  private isSubscribed = false;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.setupSubscriber();
  }

  private async setupSubscriber() {
    const subscriber = this.redisService.getSubscriber();
    
    if (!subscriber) {
      this.logger.error('Redis subscriber is not available');
      return;
    }
    
    subscriber.on('message', (channel: string, message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as PubSubMessage;
        this.handleMessage(parsedMessage);
      } catch (error) {
        this.logger.error(`Error parsing pub/sub message: ${error}`);
      }
    });

    subscriber.on('error', (error) => {
      this.logger.error(`Redis subscriber error: ${error}`);
    });
  }

  private handleMessage(message: PubSubMessage) {
    const callbacks = this.subscriptions.get(message.channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          this.logger.error(`Error in subscription callback: ${error}`);
        }
      });
    }
  }

  // Publish a message to a channel
  async publish(channel: string, message: Record<string, unknown>, publisher?: string): Promise<number> {
    const pubSubMessage: PubSubMessage = {
      channel,
      message,
      timestamp: Date.now(),
      publisher,
    };

    const publisherClient = this.redisService.getPublisher();
    const result = await publisherClient.publish(channel, JSON.stringify(pubSubMessage));
    
    this.logger.log(`Published message to channel: ${channel}`);
    return result;
  }

  // Subscribe to a channel
  async subscribe(channel: string, callback: SubscriptionCallback): Promise<void> {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
      await this.redisService.getSubscriber().subscribe(channel);
      this.logger.log(`Subscribed to channel: ${channel}`);
    }

    this.subscriptions.get(channel)!.push(callback);
  }

  // Unsubscribe from a channel
  async unsubscribe(channel: string, callback?: SubscriptionCallback): Promise<void> {
    const callbacks = this.subscriptions.get(channel);
    
    if (!callbacks) {
      return;
    }

    if (callback) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.subscriptions.delete(channel);
    }

    if (!this.subscriptions.has(channel)) {
      await this.redisService.getSubscriber().unsubscribe(channel);
      this.logger.log(`Unsubscribed from channel: ${channel}`);
    }
  }

  // Property-specific channels
  async publishPropertyUpdate(propertyId: string, update: Record<string, unknown>): Promise<void> {
    await this.publish(`property:${propertyId}`, update, 'property-service');
  }

  async subscribeToPropertyUpdates(propertyId: string, callback: SubscriptionCallback): Promise<void> {
    await this.subscribe(`property:${propertyId}`, callback);
  }

  // User-specific channels
  async publishUserNotification(userId: string, notification: Record<string, unknown>): Promise<void> {
    await this.publish(`user:${userId}:notifications`, notification, 'notification-service');
  }

  async subscribeToUserNotifications(userId: string, callback: SubscriptionCallback): Promise<void> {
    await this.subscribe(`user:${userId}:notifications`, callback);
  }

  // System-wide notifications
  async publishSystemNotification(notification: Record<string, unknown>): Promise<void> {
    await this.publish('system:notifications', notification, 'system');
  }

  async subscribeToSystemNotifications(callback: SubscriptionCallback): Promise<void> {
    await this.subscribe('system:notifications', callback);
  }

  // Real-time messaging
  async publishMessage(roomId: string, message: Record<string, unknown>): Promise<void> {
    await this.publish(`chat:${roomId}`, message, 'chat-service');
  }

  async subscribeToMessages(roomId: string, callback: SubscriptionCallback): Promise<void> {
    await this.subscribe(`chat:${roomId}`, callback);
  }

  // Property search updates
  async publishSearchUpdate(searchId: string, results: Record<string, unknown>): Promise<void> {
    await this.publish(`search:${searchId}`, results, 'search-service');
  }

  async subscribeToSearchUpdates(searchId: string, callback: SubscriptionCallback): Promise<void> {
    await this.subscribe(`search:${searchId}`, callback);
  }

  // Email notifications
  async publishEmailNotification(email: string, notification: Record<string, unknown>): Promise<void> {
    await this.publish(`email:${email}`, notification, 'email-service');
  }

  async subscribeToEmailNotifications(email: string, callback: SubscriptionCallback): Promise<void> {
    await this.subscribe(`email:${email}`, callback);
  }

  // Admin notifications
  async publishAdminNotification(adminId: string, notification: Record<string, unknown>): Promise<void> {
    await this.publish(`admin:${adminId}`, notification, 'admin-service');
  }

  async subscribeToAdminNotifications(adminId: string, callback: SubscriptionCallback): Promise<void> {
    await this.subscribe(`admin:${adminId}`, callback);
  }

  // Get active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // Get subscription count for a channel
  getSubscriptionCount(channel: string): number {
    const callbacks = this.subscriptions.get(channel);
    return callbacks ? callbacks.length : 0;
  }

  // Broadcast to multiple channels
  async broadcast(channels: string[], message: Record<string, unknown>, publisher?: string): Promise<void> {
    const promises = channels.map(channel => this.publish(channel, message, publisher));
    await Promise.all(promises);
  }

  // Pattern-based subscription
  async subscribeToPattern(pattern: string, callback: SubscriptionCallback): Promise<void> {
    await this.redisService.getSubscriber().psubscribe(pattern);
    this.subscriptions.set(pattern, [callback]);
    this.logger.log(`Subscribed to pattern: ${pattern}`);
  }

  // Pattern-based unsubscription
  async unsubscribeFromPattern(pattern: string): Promise<void> {
    await this.redisService.getSubscriber().punsubscribe(pattern);
    this.subscriptions.delete(pattern);
    this.logger.log(`Unsubscribed from pattern: ${pattern}`);
  }

  async onModuleDestroy() {
    // Clean up all subscriptions
    const channels = Array.from(this.subscriptions.keys());
    if (channels.length > 0) {
      await this.redisService.getSubscriber().unsubscribe(...channels);
    }
    this.subscriptions.clear();
  }
} 