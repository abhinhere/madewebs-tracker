import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const team = [
  ["Abhin", "abhin@madewebs.local", "Founder & Marketing Manager", "ADMIN"],
  ["Amarnath", "amarnath@madewebs.local", "Lead Developer", "MANAGER"],
  ["Arjun B", "arjun@madewebs.local", "Developer", "EMPLOYEE"],
  ["Jomin", "jomin@madewebs.local", "Developer", "EMPLOYEE"],
  ["Shibili", "shibili@madewebs.local", "Developer", "EMPLOYEE"],
];

const projects = [
  ["Nova Dental", "Nova Dental Website", "WEBSITE", "Amarnath", "DEVELOPMENT", "HIGH", "PENDING_REVIEW", 145000, 26000, 70000, 92000, "PARTIAL"],
];

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

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
  console.log("Database reset complete. No dummy datas seeded.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
