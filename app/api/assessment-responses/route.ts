import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  SINGAPORE_ACTIVITY,
  singaporeQuestions,
} from "@/lib/assessment/catalog";

export const runtime = "nodejs";

type Submission = {
  questionKey?: unknown;
  studentCode?: unknown;
  answer?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const setting = await db.classroomSetting.findUnique({
      where: { id: "main" },
      select: { isOpen: true },
    });

    if (!setting?.isOpen) {
      return NextResponse.json(
        { error: "La clase está cerrada. Puedes practicar, pero no registrar respuestas." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Submission;

    if (
      typeof body.questionKey !== "string" ||
      typeof body.studentCode !== "string" ||
      typeof body.answer !== "string"
    ) {
      return NextResponse.json(
        { error: "Datos de respuesta incompletos." },
        { status: 400 }
      );
    }

    const question = singaporeQuestions.find(
      (item) => item.key === body.questionKey
    );

    if (!question) {
      return NextResponse.json(
        { error: "Pregunta desconocida." },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({
      where: { code: body.studentCode },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Código de estudiante no encontrado." },
        { status: 404 }
      );
    }

    const numericAnswer = Number(body.answer.trim());
    const correct =
      body.answer.trim() !== "" &&
      Number.isFinite(numericAnswer) &&
      numericAnswer === question.solution;

    const response = await db.assessmentResponse.create({
      data: {
        submissionKey: randomUUID(),
        activityKey: SINGAPORE_ACTIVITY,
        questionKey: question.key,
        skill: question.skill,
        studentId: student.id,
        answerJson: JSON.stringify({
          numericAnswer: body.answer,
        }),
        points: correct ? 1 : 0,
        maxPoints: 1,
        reviewStatus: "AUTO_GRADED",
      },
      select: {
        id: true,
        points: true,
        maxPoints: true,
        reviewStatus: true,
      },
    });

    return NextResponse.json(
      {
        saved: true,
        correct,
        response,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al guardar respuesta:", error);

    return NextResponse.json(
      { error: "No se pudo registrar la respuesta." },
      { status: 500 }
    );
  }
}
