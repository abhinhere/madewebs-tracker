import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();



async function main() {
  console.log("Resetting database...");
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.paymentHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding fresh data...");
  const hashedPassword = await bcrypt.hash("Abhin2004#", 10);
  await prisma.user.create({
    data: {
      name: "Abhin",
      email: "abhin@madewebs.local",
      role: "ADMIN",
      position: "Founder & Marketing Manager",
      passwordHash: hashedPassword,
      plainPassword: "Abhin2004#",
    }
  });
  console.log("Database reset complete. Main admin seeded.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
