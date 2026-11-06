import { isTeacherAuthenticated } from "@/lib/teacher-auth";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isTeacherAuthenticated())) {
    return NextResponse.json(
      { error: "Acceso docente no autorizado." },
      { status: 401 }
    );
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 3 || query.length > 60) {
    return NextResponse.json({ students: [] });
  }

  try {
    const students = await db.student.findMany({
      where: {
        grade: 5,
        AND: [
          { firstName: { not: null } },
          { lastName: { not: null } },
        ],
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        code: true,
        firstName: true,
        lastName: true,
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
      take: 10,
    });

    return NextResponse.json(
      { students },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Student search error:", error);

    return NextResponse.json(
      { error: "No se pudo buscar estudiantes." },
      { status: 500 }
    );
  }
}
