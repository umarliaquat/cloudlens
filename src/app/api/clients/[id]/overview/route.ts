import { NextResponse } from "next/server";
import { z } from "zod";
import { provider } from "@/server/providers/mock";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const period = z
    .enum(["month", "7d", "30d"])
    .safeParse(new URL(request.url).searchParams.get("period") || "month");
  if (!period.success)
    return NextResponse.json(
      { error: "Choose a valid date range." },
      { status: 400 },
    );
  try {
    return NextResponse.json(provider.getOverview(id, period.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }
}
