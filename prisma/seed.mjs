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
  ["Aura Cafe", "Aura Cafe Brand Kit", "BRANDING", "Abhin", "REVIEW", "MEDIUM", "CLIENT_REVIEWING", 82000, 12000, 35000, 50000, "PARTIAL"],
  ["PeakFit", "PeakFit Web App", "WEB_APP", "Arjun B", "PLANNING", "URGENT", "PENDING_REVIEW", 210000, 48000, 80000, 80000, "PENDING"],
  ["Mira Events", "Mira Event Posters", "POSTER", "Jomin", "REVISION", "LOW", "CHANGES_REQUESTED", 32000, 6000, 18000, 22000, "PARTIAL"],
  ["Kairali Homes", "Kairali SEO Sprint", "SEO", "Shibili", "COMPLETED", "MEDIUM", "APPROVED", 56000, 9000, 56000, 56000, "PAID"],
  ["Lume Studio", "Lume Logo Refresh", "LOGO", "Amarnath", "DESIGNING", "HIGH", "PENDING_REVIEW", 28000, 4000, 12000, 12000, "PENDING"],
];

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const passwordHash = await bcrypt.hash("madewebs123", 10);

  const users = {};
  for (const [name, email, position, role] of team) {
    users[name] = await prisma.user.upsert({
      where: { email },
      update: { name, position, role },
      create: { name, email, position, role, passwordHash },
    });
  }

  for (let index = 0; index < projects.length; index += 1) {
    const [clientName, projectName, workType, assignee, status, priority, reviewStatus, totalPayment, expenses, advancePayment, amountPaid, paymentStatus] = projects[index];
    const client = await prisma.client.upsert({
      where: { email: `${clientName.toLowerCase().replaceAll(" ", ".")}@example.com` },
      update: { paymentStatus },
      create: {
        name: clientName,
        email: `${clientName.toLowerCase().replaceAll(" ", ".")}@example.com`,
        phone: `+91 98${index + 21}45${index + 30}210`,
        companyName: `${clientName} Pvt Ltd`,
        paymentStatus,
      },
    });

    const project = await prisma.project.create({
      data: {
        clientId: client.id,
        assignedEmployeeId: users[assignee].id,
        name: projectName,
        workType,
        status,
        priority,
        reviewStatus,
        startDate: addDays(-12 + index),
        deadline: addDays(index === 3 ? -2 : 4 + index * 3),
        notes: "Seeded production-style sample project for MadeWebs Tracker.",
        instagramPostCompleted: index % 2 === 0,
        instagramStoryCompleted: index % 3 === 0,
        deliveryCompleted: status === "COMPLETED",
      },
    });

    const payment = await prisma.payment.create({
      data: {
        clientId: client.id,
        projectId: project.id,
        advancePayment,
        totalPayment,
        expenses,
        amountPaid,
        status: paymentStatus,
      },
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        amount: advancePayment,
        note: "Advance received",
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      { userId: users.Amarnath.id, type: "DEADLINE_REMINDER", title: "Nova Dental deadline approaching", message: "Development handoff is due this week." },
      { userId: users.Abhin.id, type: "REVIEW_PENDING", title: "Aura Cafe needs review follow-up", message: "Client is reviewing the latest brand kit." },
      { userId: users["Arjun B"].id, type: "TASK_ASSIGNED", title: "PeakFit architecture task assigned", message: "Prepare the web app sprint plan." },
      { type: "PAYMENT_PENDING", title: "Pending payment alert", message: "PeakFit advance balance has not cleared yet." },
    ],
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
