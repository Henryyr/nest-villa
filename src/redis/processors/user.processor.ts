import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { PubSubService } from '../pubsub.service';

export interface UserJobData {
  userId: string;
  action: 'welcome' | 'profile-update' | 'account-deletion' | 'data-export';
  data?: any;
}

export interface WelcomeUserData {
  userId: string;
  email: string;
}

export interface ProfileUpdateData {
  userId: string;
  profileData: any;
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
    this.logger.log(`Processing user job: ${job.id}`);
    
    try {
      const jobName = job.name;
      
      switch (jobName) {
        case 'welcome-user':
          await this.processWelcomeUser(job as Job<WelcomeUserData>);
          break;
        case 'update-profile':
          await this.processProfileUpdate(job as Job<ProfileUpdateData>);
          break;
        case 'account-deletion':
          await this.processAccountDeletion(job as Job<UserJobData>);
          break;
        case 'data-export':
          await this.processDataExport(job as Job<UserJobData>);
          break;
        default:
          this.logger.warn(`Unknown job name: ${jobName}`);
      }
    } catch (error) {
      this.logger.error(`Error processing user job: ${error}`);
      throw error;
    }
  }

  private async processWelcomeUser(job: Job<WelcomeUserData>): Promise<void> {
    const { userId, email } = job.data;
    
    this.logger.log(`Processing welcome for user: ${userId}`);
    
    // Send welcome email
    await this.sendWelcomeEmail(email);
    
    // Send welcome notification
    await this.pubSubService.publishUserNotification(userId, {
      type: 'welcome',
      title: 'Welcome to Nest Villa!',
      message: 'Thank you for joining our platform. We\'re excited to have you here!',
      data: {
        userId,
        email,
        timestamp: Date.now(),
      },
    });
    
    // Update user cache
    await this.updateUserCache(userId);
    
    // Track user activity
    await this.trackUserActivity(userId, 'welcome');
    
    this.logger.log(`Welcome processed successfully for user: ${userId}`);
  }

  private async processProfileUpdate(job: Job<ProfileUpdateData>): Promise<void> {
    const { userId, profileData } = job.data;
    
    this.logger.log(`Processing profile update for user: ${userId}`);
    
    // Update profile data
    await this.updateProfileData(userId, profileData);
    
    // Update user cache
    await this.updateUserCache(userId);
    
    // Send profile update notification
    await this.pubSubService.publishUserNotification(userId, {
      type: 'profile-updated',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
      data: {
        userId,
        updatedFields: Object.keys(profileData),
        timestamp: Date.now(),
      },
    });
    
    // Track user activity
    await this.trackUserActivity(userId, 'profile-update');
    
    this.logger.log(`Profile update processed successfully for user: ${userId}`);
  }

  private async processAccountDeletion(job: Job<UserJobData>): Promise<void> {
    const { userId } = job.data;
    
    this.logger.log(`Processing account deletion for user: ${userId}`);
    
    // Remove user data from cache
    await this.cacheService.invalidateUserCache(userId);
    
    // Remove user sessions
    await this.removeUserSessions(userId);
    
    // Remove user data from search index
    await this.removeUserFromSearchIndex(userId);
    
    // Send deletion notification
    await this.pubSubService.publishUserNotification(userId, {
      type: 'account-deleted',
      title: 'Account Deleted',
      message: 'Your account has been deleted successfully.',
      data: {
        userId,
        timestamp: Date.now(),
      },
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
    if (userData) {
      await this.cacheService.cacheUser(userId, userData);
    }
  }

  private async updateProfileData(userId: string, profileData: any): Promise<void> {
    // Simulate updating profile data
    this.logger.log(`Updating profile data for user: ${userId}`);
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

  private async exportUserData(userId: string): Promise<any> {
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

  private async generateExportFile(userData: any): Promise<string> {
    // Simulate generating export file
    this.logger.log(`Generating export file for user: ${userData.userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `exports/user-${userData.userId}-${Date.now()}.json`;
  }

  private async getUserData(userId: string): Promise<any> {
    // Simulate getting user data
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
} 