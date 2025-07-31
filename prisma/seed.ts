import { PrismaClient, Role, PropertyType, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- Create Users ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '081111111111',
      role: Role.ADMIN,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Owner User',
      email: 'owner@example.com',
      password: hashedPassword,
      phone: '082222222222',
      role: Role.OWNER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Customer User',
      email: 'customer@example.com',
      password: hashedPassword,
      phone: '083333333333',
      role: Role.CUSTOMER,
    },
  });

  // --- Facilities ---
  const facilities = await prisma.facility.createMany({
    data: [
      { name: 'WiFi' },
      { name: 'Kolam Renang' },
      { name: 'AC' },
      { name: 'Parkir' },
      { name: 'Gym' },
      { name: 'Spa' },
      { name: 'Restaurant' },
      { name: 'Kitchen' },
      { name: 'Balcony' },
      { name: 'Garden' },
      { name: 'Security' },
      { name: 'Cleaning Service' },
    ],
    skipDuplicates: true,
  });

  // --- Create Property + Villa ---
  const property = await prisma.property.create({
    data: {
      title: 'Villa Mawar',
      description: 'Villa sejuk dengan kolam renang',
      location: 'Bandung',
      price: 1500000,
      type: PropertyType.VILLA,
      ownerId: owner.id,
      facilities: {
        connect: await prisma.facility.findMany({
          where: {
            name: { in: ['WiFi', 'Kolam Renang'] },
          },
        }).then(facs => facs.map(f => ({ id: f.id }))),
      },
      images: {
        create: [
          { url: 'https://via.placeholder.com/600x400' },
          { url: 'https://via.placeholder.com/600x400?2' },
        ],
      },
      villa: {
        create: {
          bedrooms: 3,
          bathrooms: 2,
          hasSwimmingPool: true,
        },
      },
      availabilities: {
        create: [
          {
            startDate: new Date('2025-08-01'),
            endDate: new Date('2025-08-15'),
          },
        ],
      },
    },
  });

  // --- Wishlist & Favorite ---
  await prisma.wishlist.create({
    data: {
      userId: customer.id,
      propertyId: property.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: customer.id,
      propertyId: property.id,
    },
  });

  // --- Booking + Payment ---
  const booking = await prisma.booking.create({
    data: {
      userId: customer.id,
      propertyId: property.id,
      startDate: new Date('2025-08-05'),
      endDate: new Date('2025-08-10'),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: 7500000,
      method: 'Credit Card',
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  // --- Review ---
  await prisma.review.create({
    data: {
      userId: customer.id,
      propertyId: property.id,
      rating: 5,
      comment: 'Tempatnya nyaman dan bersih!',
    },
  });

  // --- Notification ---
  await prisma.notification.create({
    data: {
      userId: customer.id,
      content: 'Booking kamu telah dikonfirmasi.',
    },
  });

  // --- Message (chat) ---
  await prisma.message.create({
    data: {
      senderId: customer.id,
      receiverId: owner.id,
      propertyId: property.id,
      content: 'Apakah villa ini tersedia untuk tanggal 5 - 10 Agustus?',
    },
  });

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
