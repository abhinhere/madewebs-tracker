export type Role = "Admin" | "Manager" | "Employee";
export type WorkType = "Website" | "Logo" | "Poster" | "Branding" | "Web App" | "SEO" | "Maintenance";
export type ProjectStatus = "New" | "Planning" | "Designing" | "Development" | "Review" | "Revision" | "Completed" | "Delivered";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type ReviewStatus = "Pending review" | "Client reviewing" | "Approved" | "Changes requested";
export type PaymentStatus = "Paid" | "Partial" | "Pending" | "Overdue";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  position: string;
  capacity: number;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  paymentStatus: PaymentStatus;
};

export type Payment = {
  id: string;
  projectId: string;
  clientId: string;
  advancePayment: number;
  totalPayment: number;
  expenses: number;
  amountPaid: number;
  status: PaymentStatus;
  history: { amount: number; note: string; paidAt: string }[];
};

export type Project = {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  workType: WorkType;
  assignedEmployee: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  deadline: string;
  notes: string;
  attachments: { name: string; type: string; url: string }[];
  reviewStatus: ReviewStatus;
  instagramPostCompleted: boolean;
  instagramStoryCompleted: boolean;
  deliveryCompleted: boolean;
  taskCompletion: number;
};

export type Notification = {
  id: string;
  type: "Task assigned" | "Deadline reminder" | "Review pending" | "Payment pending";
  title: string;
  message: string;
  time: string;
};

export type Activity = {
  id: string;
  actor: string;
  action: string;
  project: string;
  time: string;
};

export const teamMembers: TeamMember[] = [
  { id: "tm-1", name: "Abhin", email: "abhin@madewebs.local", role: "Admin", position: "Founder & Marketing Manager", capacity: 6 },
  { id: "tm-2", name: "Amarnath", email: "amarnath@madewebs.local", role: "Manager", position: "Lead Developer", capacity: 5 },
  { id: "tm-3", name: "Arjun B", email: "arjun@madewebs.local", role: "Employee", position: "Developer", capacity: 4 },
  { id: "tm-4", name: "Jomin", email: "jomin@madewebs.local", role: "Employee", position: "Developer", capacity: 4 },
  { id: "tm-5", name: "Shibili", email: "shibili@madewebs.local", role: "Employee", position: "Developer", capacity: 4 },
];

export const clients: Client[] = [
  { id: "cl-1", name: "Nova Dental", phone: "+91 98452 10210", email: "hello@novadental.in", companyName: "Nova Dental Clinic", paymentStatus: "Partial" },
  { id: "cl-2", name: "Aura Cafe", phone: "+91 98453 10440", email: "team@auracafe.in", companyName: "Aura Cafe LLP", paymentStatus: "Partial" },
  { id: "cl-3", name: "PeakFit", phone: "+91 98454 10670", email: "ops@peakfit.app", companyName: "PeakFit Fitness", paymentStatus: "Pending" },
  { id: "cl-4", name: "Mira Events", phone: "+91 98455 10890", email: "mira@events.co", companyName: "Mira Events Co", paymentStatus: "Overdue" },
  { id: "cl-5", name: "Kairali Homes", phone: "+91 98456 11020", email: "sales@kairalihomes.in", companyName: "Kairali Homes", paymentStatus: "Paid" },
  { id: "cl-6", name: "Lume Studio", phone: "+91 98457 11260", email: "studio@lume.design", companyName: "Lume Studio", paymentStatus: "Pending" },
];

export const projects: Project[] = [
  {
    id: "pr-1",
    clientId: "cl-1",
    clientName: "Nova Dental",
    projectName: "Nova Dental Website",
    workType: "Website",
    assignedEmployee: "Amarnath",
    status: "Development",
    priority: "High",
    startDate: "2026-05-02",
    deadline: "2026-05-24",
    notes: "Homepage and services pages are in build; content handoff pending from clinic team.",
    attachments: [{ name: "Wireframe.pdf", type: "PDF", url: "#" }],
    reviewStatus: "Pending review",
    instagramPostCompleted: true,
    instagramStoryCompleted: false,
    deliveryCompleted: false,
    taskCompletion: 68,
  },
  {
    id: "pr-2",
    clientId: "cl-2",
    clientName: "Aura Cafe",
    projectName: "Aura Cafe Brand Kit",
    workType: "Branding",
    assignedEmployee: "Abhin",
    status: "Review",
    priority: "Medium",
    startDate: "2026-05-05",
    deadline: "2026-05-22",
    notes: "Logo lockups approved internally. Awaiting client comments on color palette.",
    attachments: [{ name: "Brand-board.fig", type: "Figma", url: "#" }],
    reviewStatus: "Client reviewing",
    instagramPostCompleted: false,
    instagramStoryCompleted: false,
    deliveryCompleted: false,
    taskCompletion: 82,
  },
  {
    id: "pr-3",
    clientId: "cl-3",
    clientName: "PeakFit",
    projectName: "PeakFit Web App",
    workType: "Web App",
    assignedEmployee: "Arjun B",
    status: "Planning",
    priority: "Urgent",
    startDate: "2026-05-13",
    deadline: "2026-05-31",
    notes: "MVP scope includes membership dashboard, coach panel, and payment-ready plans.",
    attachments: [{ name: "Scope.docx", type: "Document", url: "#" }],
    reviewStatus: "Pending review",
    instagramPostCompleted: false,
    instagramStoryCompleted: false,
    deliveryCompleted: false,
    taskCompletion: 28,
  },
  {
    id: "pr-4",
    clientId: "cl-4",
    clientName: "Mira Events",
    projectName: "Mira Event Posters",
    workType: "Poster",
    assignedEmployee: "Jomin",
    status: "Revision",
    priority: "Low",
    startDate: "2026-05-01",
    deadline: "2026-05-17",
    notes: "Client requested typography changes and a second version for Instagram stories.",
    attachments: [{ name: "Poster-v2.png", type: "Image", url: "#" }],
    reviewStatus: "Changes requested",
    instagramPostCompleted: true,
    instagramStoryCompleted: true,
    deliveryCompleted: false,
    taskCompletion: 74,
  },
  {
    id: "pr-5",
    clientId: "cl-5",
    clientName: "Kairali Homes",
    projectName: "Kairali SEO Sprint",
    workType: "SEO",
    assignedEmployee: "Shibili",
    status: "Completed",
    priority: "Medium",
    startDate: "2026-04-24",
    deadline: "2026-05-20",
    notes: "Technical fixes complete. Final report ready for delivery.",
    attachments: [{ name: "SEO-report.xlsx", type: "Sheet", url: "#" }],
    reviewStatus: "Approved",
    instagramPostCompleted: true,
    instagramStoryCompleted: true,
    deliveryCompleted: true,
    taskCompletion: 100,
  },
  {
    id: "pr-6",
    clientId: "cl-6",
    clientName: "Lume Studio",
    projectName: "Lume Logo Refresh",
    workType: "Logo",
    assignedEmployee: "Amarnath",
    status: "Designing",
    priority: "High",
    startDate: "2026-05-15",
    deadline: "2026-05-27",
    notes: "Concept exploration in progress; present three routes by Friday.",
    attachments: [],
    reviewStatus: "Pending review",
    instagramPostCompleted: false,
    instagramStoryCompleted: false,
    deliveryCompleted: false,
    taskCompletion: 41,
  },
  {
    id: "pr-7",
    clientId: "cl-1",
    clientName: "Nova Dental",
    projectName: "Care Plan Maintenance",
    workType: "Maintenance",
    assignedEmployee: "Shibili",
    status: "New",
    priority: "Medium",
    startDate: "2026-05-19",
    deadline: "2026-06-06",
    notes: "Monthly care plan with content updates, speed checks, and plugin maintenance.",
    attachments: [],
    reviewStatus: "Pending review",
    instagramPostCompleted: false,
    instagramStoryCompleted: false,
    deliveryCompleted: false,
    taskCompletion: 10,
  },
];

export const payments: Payment[] = [
  { id: "pay-1", projectId: "pr-1", clientId: "cl-1", advancePayment: 70000, totalPayment: 145000, expenses: 26000, amountPaid: 92000, status: "Partial", history: [{ amount: 70000, note: "Advance received", paidAt: "2026-05-02" }, { amount: 22000, note: "Milestone payment", paidAt: "2026-05-14" }] },
  { id: "pay-2", projectId: "pr-2", clientId: "cl-2", advancePayment: 35000, totalPayment: 82000, expenses: 12000, amountPaid: 50000, status: "Partial", history: [{ amount: 35000, note: "Advance received", paidAt: "2026-05-05" }] },
  { id: "pay-3", projectId: "pr-3", clientId: "cl-3", advancePayment: 80000, totalPayment: 210000, expenses: 48000, amountPaid: 80000, status: "Pending", history: [{ amount: 80000, note: "Advance received", paidAt: "2026-05-13" }] },
  { id: "pay-4", projectId: "pr-4", clientId: "cl-4", advancePayment: 18000, totalPayment: 32000, expenses: 6000, amountPaid: 22000, status: "Overdue", history: [{ amount: 18000, note: "Advance received", paidAt: "2026-05-01" }] },
  { id: "pay-5", projectId: "pr-5", clientId: "cl-5", advancePayment: 56000, totalPayment: 56000, expenses: 9000, amountPaid: 56000, status: "Paid", history: [{ amount: 56000, note: "Full payment", paidAt: "2026-05-16" }] },
  { id: "pay-6", projectId: "pr-6", clientId: "cl-6", advancePayment: 12000, totalPayment: 28000, expenses: 4000, amountPaid: 12000, status: "Pending", history: [{ amount: 12000, note: "Advance received", paidAt: "2026-05-15" }] },
];

export const notifications: Notification[] = [
  { id: "nt-1", type: "Deadline reminder", title: "Nova Dental deadline in 5 days", message: "Development handoff needs final service content.", time: "12 min ago" },
  { id: "nt-2", type: "Review pending", title: "Aura Cafe is waiting on feedback", message: "Follow up on brand kit approval before Friday.", time: "1 hr ago" },
  { id: "nt-3", type: "Payment pending", title: "PeakFit balance pending", message: "Advance cleared; next invoice is ready to send.", time: "Today" },
  { id: "nt-4", type: "Task assigned", title: "Lume logo concepts assigned", message: "Amarnath owns three concept routes.", time: "Yesterday" },
];

export const activities: Activity[] = [
  { id: "ac-1", actor: "Abhin", action: "requested client feedback", project: "Aura Cafe Brand Kit", time: "10:20 AM" },
  { id: "ac-2", actor: "Amarnath", action: "moved project to Development", project: "Nova Dental Website", time: "9:45 AM" },
  { id: "ac-3", actor: "Jomin", action: "uploaded poster revision", project: "Mira Event Posters", time: "Yesterday" },
  { id: "ac-4", actor: "Shibili", action: "completed SEO report", project: "Kairali SEO Sprint", time: "Yesterday" },
];

export const revenueSeries = [
  { month: "Jan", revenue: 180000, profit: 121000 },
  { month: "Feb", revenue: 224000, profit: 152000 },
  { month: "Mar", revenue: 198000, profit: 131000 },
  { month: "Apr", revenue: 276000, profit: 196000 },
  { month: "May", revenue: 353000, profit: 248000 },
  { month: "Jun", revenue: 311000, profit: 217000 },
];

export const statusColumns: ProjectStatus[] = ["New", "Planning", "Designing", "Development", "Review", "Revision", "Completed", "Delivered"];
