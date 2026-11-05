
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.ENABLE_ASSESSMENT_TEST_API !== "true"
  ) {
    return NextResponse.json(
      { error: "Consulta no habilitada." },
      { status: 403 }
    );
  }

  try {
    const tickets = await db.exitTicket.findMany({
      select: {
        id: true,
        activityId: true,
        questionText: true,
        studentAnswer: true,
        justification: true,
        isCorrect: true,
        createdAt: true,
        student: {
          select: {
            code: true,
            firstName: true,
            lastName: true,
            grade: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Teacher exit tickets:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener los resultados." },
      { status: 500 }
    );
  }
}
