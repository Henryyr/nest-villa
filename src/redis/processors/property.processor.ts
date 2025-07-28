import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { PubSubService } from '../pubsub.service';

export interface PropertyJobData {
  propertyId: string;
  action: 'index' | 'update' | 'delete' | 'process-images';
  data?: any;
}

export interface PropertyImageProcessData {
  propertyId: string;
  imageUrls: string[];
}

@Processor('property')
@Injectable()
export class PropertyProcessor extends WorkerHost {
  private readonly logger = new Logger(PropertyProcessor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly pubSubService: PubSubService,
  ) {
    super();
  }

  async process(job: Job<PropertyJobData | PropertyImageProcessData>): Promise<void> {
    this.logger.log(`Processing property job: ${job.id}`);
    
    try {
      const jobName = job.name;
      
      switch (jobName) {
        case 'index-property':
          await this.processIndexProperty(job as Job<PropertyJobData>);
          break;
        case 'process-images':
          await this.processPropertyImages(job as Job<PropertyImageProcessData>);
          break;
        case 'update-property':
          await this.processPropertyUpdate(job as Job<PropertyJobData>);
          break;
        case 'delete-property':
          await this.processPropertyDelete(job as Job<PropertyJobData>);
          break;
        default:
          this.logger.warn(`Unknown job name: ${jobName}`);
      }
    } catch (error) {
      this.logger.error(`Error processing property job: ${error}`);
      throw error;
    }
  }

  private async processIndexProperty(job: Job<PropertyJobData>): Promise<void> {
    const { propertyId } = job.data;
    
    // Simulate property indexing
    this.logger.log(`Indexing property: ${propertyId}`);
    
    // Update search index
    await this.updateSearchIndex(propertyId);
    
    // Update cache
    await this.updatePropertyCache(propertyId);
    
    // Publish update
    await this.pubSubService.publishPropertyUpdate(propertyId, {
      action: 'indexed',
      timestamp: Date.now(),
    });
    
    this.logger.log(`Property indexed successfully: ${propertyId}`);
  }

  private async processPropertyImages(job: Job<PropertyImageProcessData>): Promise<void> {
    const { propertyId, imageUrls } = job.data;
    
    this.logger.log(`Processing images for property: ${propertyId}`);
    
    // Simulate image processing
    const processedImages = await this.processImages(imageUrls);
    
    // Update property with processed images
    await this.updatePropertyImages(propertyId, processedImages);
    
    // Update cache
    await this.updatePropertyCache(propertyId);
    
    // Publish update
    await this.pubSubService.publishPropertyUpdate(propertyId, {
      action: 'images-processed',
      imageCount: processedImages.length,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Images processed successfully for property: ${propertyId}`);
  }

  private async processPropertyUpdate(job: Job<PropertyJobData>): Promise<void> {
    const { propertyId, data } = job.data;
    
    this.logger.log(`Updating property: ${propertyId}`);
    
    // Update property data
    await this.updatePropertyData(propertyId, data);
    
    // Update cache
    await this.updatePropertyCache(propertyId);
    
    // Publish update
    await this.pubSubService.publishPropertyUpdate(propertyId, {
      action: 'updated',
      data,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Property updated successfully: ${propertyId}`);
  }

  private async processPropertyDelete(job: Job<PropertyJobData>): Promise<void> {
    const { propertyId } = job.data;
    
    this.logger.log(`Deleting property: ${propertyId}`);
    
    // Remove from search index
    await this.removeFromSearchIndex(propertyId);
    
    // Remove from cache
    await this.cacheService.invalidatePropertyCache(propertyId);
    
    // Publish delete event
    await this.pubSubService.publishPropertyUpdate(propertyId, {
      action: 'deleted',
      timestamp: Date.now(),
    });
    
    this.logger.log(`Property deleted successfully: ${propertyId}`);
  }

  private async updateSearchIndex(propertyId: string): Promise<void> {
    // Simulate search index update
    this.logger.log(`Updating search index for property: ${propertyId}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
  }

  private async updatePropertyCache(propertyId: string): Promise<void> {
    // Simulate property data retrieval and caching
    const propertyData = await this.getPropertyData(propertyId);
    if (propertyData) {
      await this.cacheService.cacheProperty(propertyId, propertyData);
    }
  }

  private async processImages(imageUrls: string[]): Promise<string[]> {
    // Simulate image processing
    this.logger.log(`Processing ${imageUrls.length} images`);
    
    const processedImages = imageUrls.map(url => ({
      original: url,
      thumbnail: url.replace('/original/', '/thumb/'),
      medium: url.replace('/original/', '/medium/'),
      processed: true,
    }));
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    return processedImages.map(img => img.thumbnail);
  }

  private async updatePropertyImages(propertyId: string, processedImages: string[]): Promise<void> {
    // Simulate updating property with processed images
    this.logger.log(`Updating property ${propertyId} with ${processedImages.length} processed images`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async updatePropertyData(propertyId: string, data: any): Promise<void> {
    // Simulate updating property data
    this.logger.log(`Updating property data for: ${propertyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private async removeFromSearchIndex(propertyId: string): Promise<void> {
    // Simulate removing from search index
    this.logger.log(`Removing property from search index: ${propertyId}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async getPropertyData(propertyId: string): Promise<any> {
    // Simulate getting property data
    return {
      id: propertyId,
      title: `Property ${propertyId}`,
      description: 'Sample property description',
      price: 100000,
      location: 'Sample Location',
      images: [],
      updatedAt: new Date(),
    };
  }
} 