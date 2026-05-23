# MadeWebs Tracker 2.0

Modern agency management dashboard for projects, clients, payments, reviews, deadlines, team workload, and social media delivery.

## Stack

- Next.js 15 App Router
- React 19
- Tailwind CSS 4
- shadcn/ui-style reusable components
- Prisma ORM
- PostgreSQL
- NextAuth credentials authentication
- Framer Motion
- Recharts

## Getting Started

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo credentials after seeding:

```txt
Email: abhin@madewebs.local
Password: madewebs123
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:push
npm run db:seed
```

## App Surface

- Dashboard metrics for active projects, pending reviews, monthly revenue, and pending payments
- Project table with status, priority, review state, deadlines, delivery state, and social media checkboxes
- Kanban board across the full project lifecycle
- Team workload and task completion tracking
- Client management and project history data
- Payment tracking with advance, expenses, profit, pending amount, and payment history model
- Deadline calendar list with overdue highlighting
- Notification-ready data model for assignments, deadline reminders, reviews, and payments
- Role-ready auth model for admin, manager, and employee access
