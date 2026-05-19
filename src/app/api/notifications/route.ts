import { NextResponse } from "next/server";
import { notifications } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({ data: notifications });
}
