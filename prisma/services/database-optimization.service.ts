import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Optimized property search with pagination and filtering
   */
  async findPropertiesOptimized(params: {
    page?: number;
    limit?: number;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    includeOwner?: boolean;
    includeImages?: boolean;
    includeReviews?: boolean;
  }) {
    const {
      page = 1,
      limit = 10,
      type,
      minPrice,
      maxPrice,
      location,
      includeOwner = false,
      includeImages = false,
      includeReviews = false,
    } = params;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Build include object
    const include: any = {};
    
    if (includeOwner) {
      include.owner = {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      };
    }
    
    if (includeImages) {
      include.images = {
        select: {
          id: true,
          url: true,
        },
        take: 5, // Limit to 5 images for performance
      };
    }
    
    if (includeReviews) {
      include.reviews = {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 10, // Limit to 10 reviews for performance
        orderBy: {
          createdAt: 'desc',
        },
      };
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Optimized user profile with related data
   */
  async findUserProfileOptimized(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
            reviews: true,
            bookings: true,
            wishlists: true,
            favorites: true,
            notifications: {
              where: { read: false },
            },
          },
        },
        properties: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            type: true,
            _count: {
              select: {
                reviews: true,
                bookings: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            property: {
              select: {
                id: true,
                title: true,
                location: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Optimized booking search with availability check
   */
  async findAvailableProperties(params: {
    startDate: Date;
    endDate: Date;
    page?: number;
    limit?: number;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      type,
      minPrice,
      maxPrice,
    } = params;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {
      // Check for conflicting bookings
      bookings: {
        none: {
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      },
    };

    if (type) {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
            },
            take: 3,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get database performance metrics
   */
  async getDatabaseMetrics() {
    try {
      const startTime = Date.now();
      
      // Test query performance
      await this.prisma.$queryRaw`SELECT 1`;
      
      const queryTime = Date.now() - startTime;
      
      // Get table sizes (approximate)
      const tableSizes = await this.prisma.$queryRaw<Array<{
        schemaname: string;
        tablename: string;
        attname: string;
        n_distinct: number;
        correlation: number;
      }>>`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY tablename, attname
      `;

      return {
        queryTime,
        tableStats: tableSizes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get database metrics', error);
      throw error;
    }
  }

  /**
   * Optimize database connections
   */
  async optimizeConnections() {
    try {
      // Test connection pool
      const connections = await this.prisma.$queryRaw<Array<{ active_connections: number }>>`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
      
      this.logger.log(`Active database connections: ${connections[0]?.active_connections || 0}`);
      
      return {
        activeConnections: connections[0]?.active_connections || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to optimize connections', error);
      throw error;
    }
  }
} 