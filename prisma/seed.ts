import { PrismaClient, PropertyType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'owner123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const owner = await prisma.user.create({
    data: {
      name: 'Owner Villa',
      email: 'owner@villa.com',
      password: hashedPassword, // yang dikirim ke DB adalah hash
      phone: '081234567890',
      role: Role.OWNER,
    },
  });

  const ownerId = owner.id;

  const properties = [
    {
      title: 'Villa Mewah Bali',
      description: 'Villa mewah dengan pemandangan laut di Bali',
      location: 'Bali',
      price: 5000000,
      type: PropertyType.VILLA,
      ownerId,
    },
    {
      title: 'Rumah Keluarga Jakarta',
      description: 'Rumah nyaman untuk keluarga di Jakarta Selatan',
      location: 'Jakarta Selatan',
      price: 2000000,
      type: PropertyType.HOUSE,
      ownerId,
    },
    {
      title: 'Apartemen Modern Surabaya',
      description: 'Apartemen modern di pusat kota Surabaya',
      location: 'Surabaya',
      price: 1500000,
      type: PropertyType.APARTMENT,
      ownerId,
    },
    {
      title: 'Villa Asri Ubud',
      description: 'Villa asri dengan suasana alam di Ubud',
      location: 'Ubud',
      price: 3500000,
      type: PropertyType.VILLA,
      ownerId,
    },
    {
      title: 'Rumah Minimalis Bandung',
      description: 'Rumah minimalis di kawasan strategis Bandung',
      location: 'Bandung',
      price: 1800000,
      type: PropertyType.HOUSE,
      ownerId,
    },
    {
      title: 'Apartemen View Kota Medan',
      description: 'Apartemen dengan view kota Medan',
      location: 'Medan',
      price: 1200000,
      type: PropertyType.APARTMENT,
      ownerId,
    },
    {
      title: 'Villa Private Pool Lombok',
      description: 'Villa dengan private pool di Lombok',
      location: 'Lombok',
      price: 4000000,
      type: PropertyType.VILLA,
      ownerId,
    },
    {
      title: 'Rumah Cluster Bekasi',
      description: 'Rumah cluster aman dan nyaman di Bekasi',
      location: 'Bekasi',
      price: 1700000,
      type: PropertyType.HOUSE,
      ownerId,
    },
    {
      title: 'Apartemen Dekat Kampus Yogyakarta',
      description: 'Apartemen strategis dekat kampus di Yogyakarta',
      location: 'Yogyakarta',
      price: 1300000,
      type: PropertyType.APARTMENT,
      ownerId,
    },
    {
      title: 'Villa Pantai Anyer',
      description: 'Villa dengan akses langsung ke pantai Anyer',
      location: 'Anyer',
      price: 3000000,
      type: PropertyType.VILLA,
      ownerId,
    },
  ];

  for (const data of properties) {
    await prisma.property.create({ data });
  }

  console.log('Seeded 1 owner & 10 properties!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 