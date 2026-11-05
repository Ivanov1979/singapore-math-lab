import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const tickets = {
    "experiencia-2": {
        questionText:
            "Un pirata recibe 8 monedas y ahora tiene 23. ¿Cuántas tenía?",
        correctAnswer: "15",
    },
    "experiencia-3": {
        questionText:
            "Una caja tenía lápices. Se retiran 6 y quedan 17. ¿Cuántos había?",
        correctAnswer: "23",
    },
} as const;

type TicketKey = keyof typeof tickets;

export async function POST(request: NextRequest) {
    // Keep classroom submissions disabled until the student
    // participation flow is ready and authorized.
    if (
        process.env.NODE_ENV !== "development" ||
        process.env.ENABLE_ASSESSMENT_TEST_API !== "true"
    ) {
        return NextResponse.json(
            { error: "El registro aún no está habilitado." },
            { status: 403 }
        );
    }

    try {
        const body: unknown = await request.json();

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { error: "Datos inválidos." },
                { status: 400 }
            );
        }

        const data = body as Record<string, unknown>;

        const {
            studentCode,
            activityId,
            studentAnswer,
            justification,
        } = data;

        if (
            typeof studentCode !== "string" ||
            typeof activityId !== "string" ||
            typeof studentAnswer !== "string" ||
            typeof justification !== "string" ||
            !studentCode.trim() ||
            !studentAnswer.trim() ||
            !justification.trim()
        ) {
            return NextResponse.json(
                { error: "Complete todos los campos." },
                { status: 400 }
            );
        }

        if (!(activityId in tickets)) {
            return NextResponse.json(
                { error: "Experiencia desconocida." },
                { status: 400 }
            );
        }

        const ticket = tickets[activityId as TicketKey];

        const student = await db.student.findUnique({
            where: { code: studentCode },
            select: { id: true },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Estudiante no encontrado." },
                { status: 404 }
            );
        }

        const answer = Number(studentAnswer.trim());

        const isCorrect =
            Number.isFinite(answer) &&
            answer === Number(ticket.correctAnswer);

        await db.exitTicket.create({
            data: {
                studentId: student.id,
                activityId,
                questionText: ticket.questionText,
                correctAnswer: ticket.correctAnswer,
                studentAnswer: studentAnswer.trim(),
                justification: justification.trim(),
                isCorrect,
            },
        });

        return NextResponse.json(
            { saved: true, isCorrect },
            { status: 201 }
        );
    } catch (error) {
        console.error("Exit ticket error:", error);

        return NextResponse.json(
            { error: "No se pudo guardar el ticket." },
            { status: 500 }
        );
    }
}