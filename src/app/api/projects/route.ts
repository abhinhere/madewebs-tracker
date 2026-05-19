import { NextResponse } from "next/server";
import { projects } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({ data: projects });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json(
    {
      data: {
        id: `pr-${Date.now()}`,
        ...payload,
      },
      message: "Project accepted. Connect DATABASE_URL and replace the mock service with Prisma writes for persistence.",
    },
    { status: 201 },
  );
}
