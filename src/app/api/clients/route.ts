import { NextResponse } from "next/server";
import { clients, projects } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({
    data: clients.map((client) => ({
      ...client,
      projectHistory: projects.filter((project) => project.clientId === client.id),
    })),
  });
}
