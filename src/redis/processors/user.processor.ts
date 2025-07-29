import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { CachedUser } from '../../../common/interfaces/redis.interface';
import { PubSubService } from '../pubsub.service';
import { isCachedUser } from '../../../common/utils/type-guards';

export interface UserJobData {
  userId: string;
  action: 'welcome' | 'profile-update' | 'account-deletion' | 'data-export';
  data?: Record<string, unknown>;
}

export interface WelcomeUserData {
  userId: string;
  email: string;
}

export interface ProfileUpdateData {
  userId: string;
  profileData: Record<string, unknown>;
}

@Processor('user')
@Injectable()
export class UserProcessor extends WorkerHost {
  private readonly logger = new Logger(UserProcessor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly pubSubService: PubSubService,
  ) {
    super();
  }

  async process(job: Job<UserJobData | WelcomeUserData | ProfileUpdateData>): Promise<void> {
    const { action } = job.data as UserJobData;

    switch (action) {
      case 'welcome':
        await this.processWelcomeUser(job as Job<WelcomeUserData>);
        break;
      case 'profile-update':
        await this.processProfileUpdate(job as Job<ProfileUpdateData>);
        break;
      case 'account-deletion':
        await this.processAccountDeletion(job as Job<UserJobData>);
        break;
      case 'data-export':
        await this.processDataExport(job as Job<UserJobData>);
        break;
      default:
        this.logger.warn(`Unknown user action: ${action}`);
    }
  }

  private async processWelcomeUser(job: Job<WelcomeUserData>): Promise<void> {
    const { userId, email } = job.data;
    
    this.logger.log(`Processing welcome for user: ${userId}`);
    
    // Send welcome email
    await this.sendWelcomeEmail(email);
    
    // Update user cache
    await this.updateUserCache(userId);
    
    // Track user activity
    await this.trackUserActivity(userId, 'welcome_email_sent');
    
    // Publish welcome event
    await this.pubSubService.publishUserNotification(userId, {
      type: 'welcome',
      title: 'Welcome!',
      message: 'Welcome to our platform!',
      data: { userId, email },
    });
    
    this.logger.log(`Welcome processed successfully for user: ${userId}`);
  }

  private async processProfileUpdate(job: Job<ProfileUpdateData>): Promise<void> {
    const { userId, profileData } = job.data;
    
    this.logger.log(`Processing profile update for user: ${userId}`);
    
    // Update profile data
    await this.updateProfileData(userId, profileData);
    
    // Update user cache
    await this.updateUserCache(userId);
    
    // Track user activity
    await this.trackUserActivity(userId, 'profile_updated');
    
    // Publish profile update event
    await this.pubSubService.publishUserNotification(userId, {
      type: 'profile-updated',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
      data: { userId, profileData },
    });
    
    this.logger.log(`Profile update processed successfully for user: ${userId}`);
  }

  private async processAccountDeletion(job: Job<UserJobData>): Promise<void> {
    const { userId } = job.data;
    
    this.logger.log(`Processing account deletion for user: ${userId}`);
    
    // Remove user sessions
    await this.removeUserSessions(userId);
    
    // Remove from search index
    await this.removeUserFromSearchIndex(userId);
    
    // Invalidate user cache
    await this.cacheService.invalidateUserCache(userId);
    
    // Publish account deletion event
    await this.pubSubService.publishUserNotification(userId, {
      type: 'account-deleted',
      title: 'Account Deleted',
      message: 'Your account has been deleted successfully.',
      data: { userId },
    });
    
    this.logger.log(`Account deletion processed successfully for user: ${userId}`);
  }

  private async processDataExport(job: Job<UserJobData>): Promise<void> {
    const { userId } = job.data;
    
    this.logger.log(`Processing data export for user: ${userId}`);
    
    // Export user data
    const userData = await this.exportUserData(userId);
    
    // Generate export file
    const exportFile = await this.generateExportFile(userData);
    
    // Send export notification
    await this.pubSubService.publishUserNotification(userId, {
      type: 'data-export',
      title: 'Data Export Ready',
      message: 'Your data export is ready for download.',
      data: {
        userId,
        exportFile,
        timestamp: Date.now(),
      },
    });
    
    this.logger.log(`Data export processed successfully for user: ${userId}`);
  }

  private async sendWelcomeEmail(email: string): Promise<void> {
    // Simulate sending welcome email
    this.logger.log(`Sending welcome email to: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async updateUserCache(userId: string): Promise<void> {
    // Simulate updating user cache
    const userData = await this.getUserData(userId);
    if (userData && isCachedUser(userData)) {
      await this.cacheService.cacheUser(userId, userData);
    }
  }

  private async updateProfileData(userId: string, profileData: Record<string, unknown>): Promise<void> {
    // Simulate updating profile data
    this.logger.log(`Updating profile data for user: ${userId}`, { profileData });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async trackUserActivity(userId: string, activity: string): Promise<void> {
    // Simulate tracking user activity
    this.logger.log(`Tracking activity for user: ${userId} - ${activity}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async removeUserSessions(userId: string): Promise<void> {
    // Simulate removing user sessions
    this.logger.log(`Removing sessions for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async removeUserFromSearchIndex(userId: string): Promise<void> {
    // Simulate removing user from search index
    this.logger.log(`Removing user from search index: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async exportUserData(userId: string): Promise<Record<string, unknown>> {
    // Simulate exporting user data
    this.logger.log(`Exporting data for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      userId,
      profile: { name: 'John Doe', email: 'john@example.com' },
      properties: [],
      favorites: [],
      wishlist: [],
      messages: [],
      activity: [],
      exportDate: new Date(),
    };
  }

  private async generateExportFile(userData: Record<string, unknown>): Promise<string> {
    // Simulate generating export file
    this.logger.log(`Generating export file for user: ${userData.userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `exports/user-${userData.userId}-${Date.now()}.json`;
  }

  private async getUserData(userId: string): Promise<CachedUser | null> {
    // Simulate getting user data with proper structure
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+6281234567890',
      role: 'CUSTOMER',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
} 