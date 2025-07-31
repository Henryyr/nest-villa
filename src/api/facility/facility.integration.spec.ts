import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('FacilityController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let ownerToken: string;
  let testFacilityId: string;
  let testPropertyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create test users and tokens
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashedpassword',
        phone: '1234567890',
        role: 'ADMIN',
      },
    });

    const ownerUser = await prisma.user.create({
      data: {
        name: 'Owner User',
        email: 'owner@test.com',
        password: 'hashedpassword',
        phone: '1234567891',
        role: 'OWNER',
      },
    });

    adminToken = jwtService.sign({ 
      sub: adminUser.id, 
      email: adminUser.email, 
      role: adminUser.role 
    });

    ownerToken = jwtService.sign({ 
      sub: ownerUser.id, 
      email: ownerUser.email, 
      role: ownerUser.role 
    });

    // Create test property
    const testProperty = await prisma.property.create({
      data: {
        title: 'Test Property',
        description: 'Test Description',
        location: 'Test Location',
        price: 1000000,
        type: 'VILLA',
        ownerId: ownerUser.id,
      },
    });
    testPropertyId = testProperty.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.facility.deleteMany({
      where: {
        name: {
          in: ['Test Facility', 'Updated Test Facility', 'Swimming Pool', 'Gym'],
        },
      },
    });

    await prisma.property.delete({
      where: { id: testPropertyId },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'owner@test.com'],
        },
      },
    });

    await app.close();
  });

  describe('/facilities (GET)', () => {
    it('should return all facilities', () => {
      return request(app.getHttpServer())
        .get('/facilities')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return facilities with search', () => {
      return request(app.getHttpServer())
        .get('/facilities?search=pool')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/facilities (POST)', () => {
    it('should create a new facility (admin only)', () => {
      return request(app.getHttpServer())
        .post('/facilities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Facility',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Facility');
          testFacilityId = res.body.id;
        });
    });

    it('should not allow non-admin to create facility', () => {
      return request(app.getHttpServer())
        .post('/facilities')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Facility 2',
        })
        .expect(403);
    });

    it('should not create duplicate facility', () => {
      return request(app.getHttpServer())
        .post('/facilities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Facility',
        })
        .expect(409);
    });
  });

  describe('/facilities/:id (GET)', () => {
    it('should return facility by ID', () => {
      return request(app.getHttpServer())
        .get(`/facilities/${testFacilityId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testFacilityId);
          expect(res.body.name).toBe('Test Facility');
        });
    });

    it('should return 404 for non-existent facility', () => {
      return request(app.getHttpServer())
        .get('/facilities/non-existent-id')
        .expect(404);
    });
  });

  describe('/facilities/:id (PUT)', () => {
    it('should update facility (admin only)', () => {
      return request(app.getHttpServer())
        .put(`/facilities/${testFacilityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Facility',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Test Facility');
        });
    });

    it('should not allow non-admin to update facility', () => {
      return request(app.getHttpServer())
        .put(`/facilities/${testFacilityId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Another Update',
        })
        .expect(403);
    });
  });

  describe('/facilities/property/:propertyId/add (POST)', () => {
    it('should add facilities to property (owner/admin)', async () => {
      // Create test facilities first
      const facility1 = await prisma.facility.create({
        data: { name: 'Swimming Pool' },
      });
      const facility2 = await prisma.facility.create({
        data: { name: 'Gym' },
      });

      return request(app.getHttpServer())
        .post(`/facilities/property/${testPropertyId}/add`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          facilityIds: [facility1.id, facility2.id],
        })
        .expect(200);
    });
  });

  describe('/facilities/property/:propertyId (GET)', () => {
    it('should return property facilities', () => {
      return request(app.getHttpServer())
        .get(`/facilities/property/${testPropertyId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/facilities/:id (DELETE)', () => {
    it('should delete facility (admin only)', () => {
      return request(app.getHttpServer())
        .delete(`/facilities/${testFacilityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not allow non-admin to delete facility', () => {
      return request(app.getHttpServer())
        .delete(`/facilities/${testFacilityId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403);
    });
  });
}); 