import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { EphemeralMessageJob } from '../../common/interfaces/job-data.interface';

@Processor('ephemeral-messages')
@Injectable()
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name);

  async process(job: Job<EphemeralMessageJob>): Promise<void> {
    this.logger.log(`Delivering ephemeral message: ${JSON.stringify(job.data)}`);
    // TODO: Implement delivery to recipient (e.g., via WebSocket, push, etc.)
    // DO NOT store in DB!
  }
} 