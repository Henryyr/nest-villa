// Jest setup file
require('jest-extended');

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock Redis to prevent connection issues in tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn(),
    disconnect: jest.fn(),
  }));
});

// Mock BullMQ to prevent queue connection issues in tests
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    getJob: jest.fn(),
    getJobs: jest.fn(),
    getJobCounts: jest.fn(),
    close: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
  Job: jest.fn().mockImplementation(() => ({
    id: 'test-job-id',
    data: {},
    name: 'test-job',
  })),
}));

// Mock @prisma/client to prevent connection issues
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    property: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    favorite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    wishlist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Global test utilities
global.TestUtils = require('./src/common/utils/test-utils').TestUtils;

// Custom matchers for better test assertions
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Date`,
        pass: false,
      };
    }
  },
  toHaveValidPagination(received) {
    const pass = 
      received &&
      typeof received === 'object' &&
      Array.isArray(received.data) &&
      typeof received.total === 'number' &&
      typeof received.page === 'number' &&
      typeof received.limit === 'number';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have valid pagination structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have valid pagination structure`,
        pass: false,
      };
    }
  },
});

// Helper function to create mock modules
global.createMockModule = (providers) => {
  return {
    providers,
    exports: {},
  };
};

// Helper function to create mock services
global.createMockService = (methods) => {
  const mockService = {};
  Object.keys(methods).forEach(key => {
    mockService[key] = jest.fn().mockImplementation(methods[key]);
  });
  return mockService;
};

// Helper function to create mock repositories
global.createMockRepository = (methods) => {
  const mockRepository = {};
  Object.keys(methods).forEach(key => {
    mockRepository[key] = jest.fn().mockImplementation(methods[key]);
  });
  return mockRepository;
};

// Helper function to create mock DTOs
global.createMockDto = (dtoClass, data) => {
  return Object.assign(new dtoClass(), data);
};

// Helper function to create mock entities
global.createMockEntity = (entityClass, data) => {
  return Object.assign(new entityClass(), data);
};

// Helper function to create mock responses
global.createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Helper function to create mock requests
global.createMockRequest = (data = {}) => {
  return {
    user: data.user || { id: 'test-user', email: 'test@example.com', role: 'CUSTOMER' },
    params: data.params || {},
    query: data.query || {},
    body: data.body || {},
    headers: data.headers || {},
    method: data.method || 'GET',
    url: data.url || '/test',
    ip: data.ip || '127.0.0.1',
  };
};

// Helper function to create mock contexts
global.createMockContext = (data = {}) => {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(createMockRequest(data.request)),
      getResponse: jest.fn().mockReturnValue(createMockResponse()),
    }),
  };
};

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
});

// Global test teardown
afterAll(async () => {
  // Clean up any remaining handles
  await new Promise(resolve => setTimeout(resolve, 100));
});