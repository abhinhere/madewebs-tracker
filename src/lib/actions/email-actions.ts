"use server";

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendApprovalEmail(projectId: string, message: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignedEmployee: true,
      },
    });

    if (!project) throw new Error("Project not found");

    // Fetch all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    if (admins.length === 0) {
      console.warn("No admin users found to send email to.");
      return { success: false, error: "No admin users found" };
    }

    const adminEmails = admins.map(a => a.email).join(", ");

    // Setup Nodemailer transport
    // Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, 
      auth: {
        user: process.env.SMTP_USER || "test@example.com",
        pass: process.env.SMTP_PASS || "password",
      },
    });

    const mailOptions = {
      from: `"MadeWebs Tracker" <${process.env.SMTP_USER || "noreply@madewebs.com"}>`,
      to: adminEmails,
      subject: `Approval Required: ${project.name}`,
      html: `
        <h2>Project Approval Request</h2>
        <p><strong>Project:</strong> ${project.name}</p>
        <p><strong>Employee:</strong> ${project.assignedEmployee?.name || 'Unknown'}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">${message || "No additional message."}</blockquote>
        <br/>
        <p>Please log in to the dashboard to review and approve this project.</p>
      `,
    };

    if (!process.env.SMTP_HOST) {
      console.log("No SMTP credentials found. Simulating email sending...");
      console.log("================ MOCK EMAIL ================");
      console.log(`To: ${adminEmails}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.html}`);
      console.log("============================================");
    } else {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${adminEmails}`);
    }

    // Also update reviewStatus to 'CLIENT_REVIEWING' or 'PENDING_REVIEW' 
    // to reflect that it's actively waiting on someone? Let's just keep it simple and notify.
    
    revalidatePath("/(dashboard)");
    return { success: true };
  } catch (error: any) {
    console.error("Error sending approval email:", error);
    return { success: false, error: error.message };
  }
}
