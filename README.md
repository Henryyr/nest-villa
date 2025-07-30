# Nest Villa Backend

A comprehensive property rental backend built with NestJS, featuring authentication, property management, booking system, and real-time messaging.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, OWNER, CUSTOMER)
- Password reset functionality
- Session management

### Property Management
- **Owner Property Creation**: Owners can create new properties with Google Maps integration
- Property CRUD operations
- Property types: Villa, House, Apartment
- Location with latitude/longitude coordinates
- Property images and facilities
- Search and filtering capabilities

### File Upload & Storage
- **Supabase Storage Integration**: Secure file upload with cloud storage
- **Redis Caching**: Optimized file retrieval with caching
- **Multiple File Types**: Property images, user avatars, documents
- **File Validation**: Size and type validation
- **Owner-only Upload**: Only owners can upload files
- **Automatic Cleanup**: Files deleted when property is deleted

### Booking & Reservations
- Property booking system
- Availability tracking
- Payment integration
- Date range booking

### User Features
- User profiles and avatars
- Favorites and wishlist management
- Real-time messaging between users and owners
- Notification system

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile

### Property Management (Owner Only)
- `GET /property/my-properties` - Get owner's properties
- `POST /property` - Create new property (Owner only)
- `PATCH /property/:id` - Update property (Owner only)
- `DELETE /property/:id` - Delete property (Owner only)

### File Management (Owner Only)
- `POST /files/upload` - Upload file (Owner only)
- `GET /files/my-files` - Get user files (Owner only)
- `GET /files/:fileId` - Get file information
- `DELETE /files/:fileId` - Delete file (Owner only)
- `GET /files/property/:propertyId/images` - Get property images

### Property Browsing (Public)
- `GET /property` - List all properties
- `GET /property/:id` - Get property details

### User Management (Admin Only)
- `GET /users` - List all users
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Messaging
- `POST /messages/send` - Send persistent message
- `POST /messages/send-ephemeral` - Send ephemeral message
- `GET /messages/conversation/:otherUserId` - Get conversation
- `GET /messages/conversations` - Get all conversations

### Favorites & Wishlist
- `POST /favorite` - Add to favorites
- `DELETE /favorite/:propertyId` - Remove from favorites
- `GET /favorite` - Get user favorites
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:propertyId` - Remove from wishlist
- `GET /wishlist` - Get user wishlist

## 🏗️ Owner Property Creation

### Creating a New Property

Owners can create new properties using the following API:

```bash
POST /property
Authorization: Bearer <owner-jwt-token>
Content-Type: application/json

{
  "title": "Luxury Villa with Pool",
  "description": "Beautiful 3-bedroom villa with private swimming pool",
  "location": "Jl. Sunset Road No. 123, Kuta, Bali",
  "price": 1500000,
  "type": "VILLA",
  "latitude": -8.7832,
  "longitude": 115.2169
}
```

### Required Fields
- `title`: Property title
- `description`: Property description
- `location`: Address location
- `price`: Price per night (in IDR)
- `type`: Property type (VILLA, HOUSE, APARTMENT)

### Optional Fields
- `latitude`: Latitude coordinate from Google Maps
- `longitude`: Longitude coordinate from Google Maps

### Getting Owner's Properties

```bash
GET /property/my-properties
Authorization: Bearer <owner-jwt-token>
```

## 📁 File Upload System

### Uploading Files

Owners can upload files using the following API:

```bash
POST /files/upload
Authorization: Bearer <owner-jwt-token>
Content-Type: application/json

{
  "fileType": "PROPERTY_IMAGE",
  "propertyId": "property-uuid",
  "fileName": "villa-exterior.jpg",
  "fileContent": "base64-encoded-file-content",
  "mimeType": "image/jpeg"
}
```

### File Types
- `PROPERTY_IMAGE`: Images for properties
- `USER_AVATAR`: User profile pictures
- `DOCUMENT`: Documents and PDFs

### File Validation
- **Size Limit**: Maximum 10MB per file
- **Allowed Types**: JPEG, PNG, WebP, GIF, PDF, DOC, DOCX
- **Required Fields**: fileName, fileContent, mimeType, fileType
- **Property Images**: propertyId is required for PROPERTY_IMAGE type

### Getting Property Images

```bash
GET /files/property/:propertyId/images
```

### Getting User Files

```bash
GET /files/my-files
Authorization: Bearer <owner-jwt-token>
```

### Deleting Files

```bash
DELETE /files/:fileId
Authorization: Bearer <owner-jwt-token>
```

## 🔧 Setup

### Environment Variables

Add the following to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_CACHE_DB=0
REDIS_QUEUE_DB=1

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"
```

### Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and service key

2. **Create Storage Buckets**:
   ```sql
   -- Create buckets for different file types
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('property-images', 'property-images', true),
   ('user-avatars', 'user-avatars', true),
   ('documents', 'documents', false);
   ```

3. **Set up RLS Policies**:
   ```sql
   -- Allow authenticated users to upload files
   CREATE POLICY "Users can upload files" ON storage.objects
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   -- Allow public read access to property images
   CREATE POLICY "Public read access to property images" ON storage.objects
   FOR SELECT USING (bucket_id = 'property-images');

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete own files" ON storage.objects
   FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
bun prisma migrate dev
```

4. Start the development server:
```bash
bun run start:dev
```

## 🧪 Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Test coverage
bun run test:cov
```

## 📚 Documentation

API documentation is available at `/api` when the server is running.

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Storage**: Supabase Storage
- **Authentication**: JWT
- **Queue**: BullMQ
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI

## 🚀 Performance Features

### Redis Caching Strategy
- **File Metadata**: Cache file information for 1 hour
- **Property Images**: Cache property image lists for 1 hour
- **User Files**: Cache user file lists for 30 minutes
- **Automatic Invalidation**: Cache cleared when files are deleted

### File Storage Optimization
- **CDN Integration**: Supabase Storage with global CDN
- **Image Optimization**: Automatic image compression
- **Lazy Loading**: Images loaded on demand
- **Caching Headers**: Proper cache headers for static files

### Security Features
- **File Type Validation**: Only allowed file types accepted
- **Size Limits**: Maximum file size enforcement
- **Owner-only Access**: Only property owners can upload files
- **RLS Policies**: Row-level security for file access