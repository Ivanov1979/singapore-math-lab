import { isTeacherAuthenticated } from "@/lib/teacher-auth";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
    if (!(await isTeacherAuthenticated())) {
        return NextResponse.json(
            { error: "Acceso docente no autorizado." },
            { status: 401 }
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
