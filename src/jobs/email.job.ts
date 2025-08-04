import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueService } from './queue.service';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

@Injectable()
export class EmailJob {
  constructor(private readonly queueService: QueueService) {}

  async processEmail(job: Job<EmailJobData>) {
    const { to, subject, template, data } = job.data;
    
    try {
      // Implementation for sending email
      console.log(`Sending email to ${to} with subject: ${subject}`);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, messageId: `email_${Date.now()}` };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async addEmailJob(emailData: EmailJobData) {
    return this.queueService.addJob('email', emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
} 