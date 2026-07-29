import bcrypt from "bcryptjs";
import { PrismaClient, Gender, ProviderType, Role } from "@prisma/client";

const prisma = new PrismaClient();

const pets = [
  { nameZh: "餅餅", nameEn: "Banban", breed: "British Shorthair", gender: Gender.FEMALE, dob: new Date("2025-08-11"), weight: 3.8 },
  { nameZh: "糕糕", nameEn: "Gogo", breed: "Maine Coon", gender: Gender.MALE, dob: new Date("2026-01-02"), weight: 2.1 },
  { nameZh: "包包", nameEn: "Pawpaw", breed: "Maine Coon", gender: Gender.MALE, dob: new Date("2026-01-02"), weight: 2.3 }
];

async function main() {
  const passwordHash = bcrypt.hashSync("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash,
      displayName: "Dr. Sarah Chen",
      role: Role.ADMIN,
      isActive: true
    },
    create: {
      username: "admin",
      passwordHash,
      displayName: "Dr. Sarah Chen",
      role: Role.ADMIN,
      isActive: true
    }
  });

  for (const pet of pets) {
    await prisma.pet.upsert({
      where: { nameEn: pet.nameEn },
      update: { ...pet, isActive: true },
      create: pet
    });
  }

  await prisma.llmConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      provider: ProviderType.OPENROUTER,
      apiBaseUrl: "https://openrouter.ai/api/v1",
      apiKey: "",
      defaultModel: "deepseek/deepseek-v4-flash",
      temperature: 0.3,
      maxTokens: 4000,
      isActive: true,
      updatedById: admin.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
