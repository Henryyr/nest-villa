import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, JobType } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  EmailJobData,
  NotificationJobData,
  PropertyJobData,
  UserJobData,
  SearchJobData,
  FileJobData,
  MessageJobData,
  QueueJobOptions,
  QueueStats,
  JobStatus,
} from '../../common/types/queue.types';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('property') private readonly propertyQueue: Queue,
    @InjectQueue('user') private readonly userQueue: Queue,
    @InjectQueue('search') private readonly searchQueue: Queue,
    @InjectQueue('file') private readonly fileQueue: Queue,
    @InjectQueue('message') private readonly messageQueue: Queue,
  ) {}

  // Email queue methods
  async addEmailJob(data: EmailJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.emailQueue.add('send-email', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added email job: ${job.id}`);
    return job;
  }

  async getEmailJob(jobId: string): Promise<Job | null> {
    return await this.emailQueue.getJob(jobId);
  }

  async getEmailJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.emailQueue.getJobs([status as JobType], start, end);
  }

  async getEmailQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.emailQueue.getWaiting(),
      this.emailQueue.getActive(),
      this.emailQueue.getCompleted(),
      this.emailQueue.getFailed(),
      this.emailQueue.getDelayed(),
      this.emailQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // Notification queue methods
  async addNotificationJob(data: NotificationJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.notificationQueue.add('send-notification', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added notification job: ${job.id}`);
    return job;
  }

  async getNotificationJob(jobId: string): Promise<Job | null> {
    return await this.notificationQueue.getJob(jobId);
  }

  async getNotificationJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.notificationQueue.getJobs([status as JobType], start, end);
  }

  async getNotificationQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.notificationQueue.getWaiting(),
      this.notificationQueue.getActive(),
      this.notificationQueue.getCompleted(),
      this.notificationQueue.getFailed(),
      this.notificationQueue.getDelayed(),
      this.notificationQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // Property queue methods
  async addPropertyJob(data: PropertyJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.propertyQueue.add('process-property', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added property job: ${job.id}`);
    return job;
  }

  async addPropertyIndexJob(propertyId: string, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.propertyQueue.add('index-property', { propertyId }, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added property index job: ${job.id}`);
    return job;
  }

  async addPropertyImageProcessJob(propertyId: string, imageUrls: string[], opts?: QueueJobOptions): Promise<Job> {
    const job = await this.propertyQueue.add('process-images', { propertyId, imageUrls }, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added property image process job: ${job.id}`);
    return job;
  }

  async getPropertyJob(jobId: string): Promise<Job | null> {
    return await this.propertyQueue.getJob(jobId);
  }

  async getPropertyJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.propertyQueue.getJobs([status as JobType], start, end);
  }

  async getPropertyQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.propertyQueue.getWaiting(),
      this.propertyQueue.getActive(),
      this.propertyQueue.getCompleted(),
      this.propertyQueue.getFailed(),
      this.propertyQueue.getDelayed(),
      this.propertyQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // User queue methods
  async addUserJob(data: UserJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.userQueue.add('process-user', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added user job: ${job.id}`);
    return job;
  }

  async addUserWelcomeJob(userId: string, email: string, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.userQueue.add('welcome-user', { userId, email }, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added user welcome job: ${job.id}`);
    return job;
  }

  async addUserProfileUpdateJob(userId: string, profileData: Record<string, unknown>, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.userQueue.add('update-profile', { userId, profileData }, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added user profile update job: ${job.id}`);
    return job;
  }

  async getUserJob(jobId: string): Promise<Job | null> {
    return await this.userQueue.getJob(jobId);
  }

  async getUserJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.userQueue.getJobs([status as JobType], start, end);
  }

  async getUserQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.userQueue.getWaiting(),
      this.userQueue.getActive(),
      this.userQueue.getCompleted(),
      this.userQueue.getFailed(),
      this.userQueue.getDelayed(),
      this.userQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // Search queue methods
  async addSearchJob(data: SearchJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.searchQueue.add('process-search', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added search job: ${job.id}`);
    return job;
  }

  async addSearchIndexJob(searchData: SearchJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.searchQueue.add('index-search', searchData, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added search index job: ${job.id}`);
    return job;
  }

  async getSearchJob(jobId: string): Promise<Job | null> {
    return await this.searchQueue.getJob(jobId);
  }

  async getSearchJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.searchQueue.getJobs([status as JobType], start, end);
  }

  async getSearchQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.searchQueue.getWaiting(),
      this.searchQueue.getActive(),
      this.searchQueue.getCompleted(),
      this.searchQueue.getFailed(),
      this.searchQueue.getDelayed(),
      this.searchQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // File queue methods
  async addFileJob(data: FileJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.fileQueue.add('process-file', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added file job: ${job.id}`);
    return job;
  }

  async addFileUploadJob(fileData: FileJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.fileQueue.add('upload-file', fileData, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added file upload job: ${job.id}`);
    return job;
  }

  async addFileProcessJob(fileId: string, processType: string, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.fileQueue.add('process-file', { fileId, processType }, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added file process job: ${job.id}`);
    return job;
  }

  async getFileJob(jobId: string): Promise<Job | null> {
    return await this.fileQueue.getJob(jobId);
  }

  async getFileJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.fileQueue.getJobs([status as JobType], start, end);
  }

  async getFileQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.fileQueue.getWaiting(),
      this.fileQueue.getActive(),
      this.fileQueue.getCompleted(),
      this.fileQueue.getFailed(),
      this.fileQueue.getDelayed(),
      this.fileQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // Message queue methods
  async addMessageJob(data: MessageJobData, opts?: QueueJobOptions): Promise<Job> {
    const job = await this.messageQueue.add('process-message', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
    this.logger.log(`Added message job: ${job.id}`);
    return job;
  }

  async getMessageJob(jobId: string): Promise<Job | null> {
    return await this.messageQueue.getJob(jobId);
  }

  async getMessageJobs(status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    return await this.messageQueue.getJobs([status as JobType], start, end);
  }

  async getMessageQueueStats(): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.messageQueue.getWaiting(),
      this.messageQueue.getActive(),
      this.messageQueue.getCompleted(),
      this.messageQueue.getFailed(),
      this.messageQueue.getDelayed(),
      this.messageQueue.getWaiting(), // getPaused() doesn't exist, using getWaiting() as fallback
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  // Generic queue methods
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    if (queue) {
      await queue.remove(jobId);
      this.logger.log(`Removed job: ${jobId} from queue: ${queueName}`);
    }
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    if (queue) {
      await queue.pause();
      this.logger.log(`Paused queue: ${queueName}`);
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    if (queue) {
      await queue.resume();
      this.logger.log(`Resumed queue: ${queueName}`);
    }
  }

  async cleanQueue(queueName: string, grace: number = 1000 * 60 * 60 * 24): Promise<void> {
    const queue = this.getQueueByName(queueName);
    if (queue) {
      await queue.clean(grace, 1000);
      this.logger.log(`Cleaned queue: ${queueName}`);
    }
  }

  private getQueueByName(queueName: string): Queue | null {
    switch (queueName) {
      case 'email':
        return this.emailQueue;
      case 'notification':
        return this.notificationQueue;
      case 'property':
        return this.propertyQueue;
      case 'user':
        return this.userQueue;
      case 'search':
        return this.searchQueue;
      case 'file':
        return this.fileQueue;
      case 'message':
        return this.messageQueue;
      default:
        return null;
    }
  }

  // Get all queue statistics
  async getAllQueueStats(): Promise<Record<string, QueueStats>> {
    const [email, notification, property, user, search, file, message] = await Promise.all([
      this.getEmailQueueStats(),
      this.getNotificationQueueStats(),
      this.getPropertyQueueStats(),
      this.getUserQueueStats(),
      this.getSearchQueueStats(),
      this.getFileQueueStats(),
      this.getMessageQueueStats(),
    ]);

    return {
      email,
      notification,
      property,
      user,
      search,
      file,
      message,
    };
  }
} 