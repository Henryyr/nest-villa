# Nest Villa API

A comprehensive villa rental API built with NestJS, featuring real-time messaging, favorites/wishlist management, and advanced caching.

## 🚀 Features

- **User Management**: Complete CRUD operations with role-based access
- **Property Management**: Villa listings with search and filtering
- **Real-time Messaging**: Persistent and ephemeral messages between users
- **Favorites & Wishlists**: User preference management
- **Advanced Caching**: Redis-based caching for optimal performance
- **Queue Management**: Background job processing with BullMQ
- **Pub/Sub**: Real-time notifications and updates
- **Rate Limiting**: API protection and abuse prevention
- **Session Management**: Secure user sessions
- **Token Management**: JWT and refresh token handling

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Queue**: BullMQ
- **Authentication**: JWT
- **Validation**: class-validator
- **Testing**: Jest with comprehensive coverage
- **Documentation**: Swagger/OpenAPI

## 📦 Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations
bun run prisma:migrate

# Start development server
bun run start:dev
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun run test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch

# Run tests for CI
bun run test:ci
```

### Test Coverage

The project maintains **80%+ test coverage** across all critical components:

- **Services**: 100% coverage for business logic
- **Controllers**: 95% coverage for API endpoints
- **Repositories**: 90% coverage for data access
- **Utilities**: 85% coverage for helper functions

### Coverage Reports

Coverage reports are generated in multiple formats:

- **HTML**: `coverage/index.html` - Interactive coverage report
- **LCOV**: `coverage/lcov.info` - For CI/CD integration
- **JSON**: `coverage/coverage-final.json` - For custom reporting
- **Text**: Console output with summary

### Test Structure

```
src/
├── users/
│   ├── users.service.spec.ts          # Unit tests
│   └── users.integration.spec.ts      # Integration tests
├── message/
│   ├── message.service.spec.ts        # Unit tests
│   └── message.integration.spec.ts    # Integration tests
├── property/
│   ├── property.service.spec.ts       # Unit tests
│   └── property.integration.spec.ts   # Integration tests
├── favorite/
│   ├── favorite.service.spec.ts       # Unit tests
│   └── favorite.integration.spec.ts   # Integration tests
├── wishlist/
│   ├── wishlist.service.spec.ts       # Unit tests
│   └── wishlist.integration.spec.ts   # Integration tests
└── common/
    └── utils/
        └── test-utils.ts              # Test utilities
```

### Test Utilities

The project includes comprehensive test utilities:

```typescript
import { TestUtils } from './src/common/utils/test-utils';

// Create mock data
const mockUser = TestUtils.createMockUser();
const mockProperty = TestUtils.createMockProperty();
const mockMessage = TestUtils.createMockMessage();

// Create mock DTOs
const createUserDto = TestUtils.createMockCreateUserDto();
const updateUserDto = TestUtils.createMockUpdateUserDto();

// Create mock services
const mockCacheService = TestUtils.createMockCacheMethods();
const mockQueueService = TestUtils.createMockQueueMethods();
```

### Custom Matchers

Extended Jest matchers for better assertions:

```typescript
// UUID validation
expect(userId).toBeValidUUID();

// Date validation
expect(createdAt).toBeValidDate();

// Pagination structure validation
expect(result).toHaveValidPagination();
```

## 🔧 Development

### Code Quality

```bash
# Run linter
bun run lint

# Format code
bun run format

# Type checking
bun run build
```

### Database

```bash
# Generate Prisma client
bun run prisma:generate

# Run migrations
bun run prisma:migrate

# Reset database
bun run prisma:reset

# Seed database
bun run seed
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **ReDoc**: `http://localhost:3000/api-json`

## 🚀 Deployment

```bash
# Build for production
bun run build

# Start production server
bun run start:prod
```

## 📊 Monitoring

- **Health Checks**: `/health`
- **Metrics**: `/metrics`
- **Queue Status**: `/queues`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.