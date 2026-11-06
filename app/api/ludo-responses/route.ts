
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challenges } from "@/lib/ludo/challenges";
import type { MathSkill } from "@prisma/client";

export const runtime = "nodejs";

const ACTIVITY_KEY = "ludo-matematico";

const sectionSkills: MathSkill[] = [
    "RESOLVER_PROBLEMAS",
    "ARGUMENTAR_COMUNICAR",
    "ARGUMENTAR_COMUNICAR",
    "REPRESENTAR",
    "RESOLVER_PROBLEMAS",
    "MODELAR",
    "ARGUMENTAR_COMUNICAR",
    "RESOLVER_PROBLEMAS",
];

type Submission = {
    studentCode?: unknown;
    questionNumber?: unknown;
    selectedOption?: unknown;
    argument?: unknown;
    reflection?: unknown;
    attempts?: unknown;
    argumentValidated?: unknown;
    submissionKey?: unknown;
};

export async function POST(request: Request) {
    // Only accept submissions while the teacher has opened the classroom.
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
    } catch (error) {
        console.error("Ludo classroom status error:", error);
        return NextResponse.json(
            { error: "No se pudo verificar el estado de la clase." },
            { status: 503 }
        );
    }

    let body: Submission;

    try {
        body = (await request.json()) as Submission;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON." },
            { status: 400 }
        );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json(
            { error: "Invalid request body." },
            { status: 400 }
        );
    }

    const {
        studentCode,
        questionNumber,
        selectedOption,
        argument,
        reflection,
        attempts,
        argumentValidated,
        submissionKey,
    } = body;

    if (
        typeof studentCode !== "string" ||
        !studentCode.trim() ||
        studentCode.length > 100 ||
        !Number.isInteger(questionNumber) ||
        (questionNumber as number) < 1 ||
        (questionNumber as number) > challenges.length ||
        !Number.isInteger(selectedOption) ||
        (selectedOption as number) < 0 ||
        (selectedOption as number) > 2 ||
        typeof argument !== "string" ||
        !argument.trim() ||
        argument.length > 4000 ||
        typeof reflection !== "string" ||
        !reflection.trim() ||
        reflection.length > 4000 ||
        !Number.isInteger(attempts) ||
        (attempts as number) < 1 ||
        (attempts as number) > 100 ||
        typeof argumentValidated !== "boolean" ||
        typeof submissionKey !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            submissionKey
        )
    ) {
        return NextResponse.json(
            { error: "Invalid submission data." },
            { status: 400 }
        );
    }

    try {
        const student = await db.student.findUnique({
            where: { code: studentCode.trim() },
            select: { id: true },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student not found." },
                { status: 404 }
            );
        }

        const number = questionNumber as number;
        const option = selectedOption as number;
        const challenge = challenges[number - 1];
        const skill = sectionSkills[Math.floor((number - 1) / 5)];

        if (!challenge || !skill) {
            return NextResponse.json(
                { error: "Question not found." },
                { status: 400 }
            );
        }

        const correct = option === challenge.correct;

        const answerJson = JSON.stringify({
            selectedOption: option,
            selectedText: challenge.options[option],
            correct,
            argument: argument.trim(),
            reflection: reflection.trim(),
            attempts,
            argumentValidated,
        });

        const result = await db.assessmentResponse.create({
            data: {
                submissionKey,
                activityKey: ACTIVITY_KEY,
                questionKey: `ludo-${number}`,
                skill,
                studentId: student.id,
                answerJson,
                points: correct ? 1 : 0,
                maxPoints: 1,
                reviewStatus: "PENDING",
            },
            select: {
                id: true,
                questionKey: true,
                skill: true,
                points: true,
                reviewStatus: true,
            },
        });

        return NextResponse.json(
            { saved: true, result },
            { status: 201 }
        );
    } catch (error) {
        // The unique submission key prevents duplicate records.
        // The client can safely retry the same submission.
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { saved: true, duplicate: true },
                { status: 200 }
            );
        }

        console.error("Ludo response save failed:", error);

        return NextResponse.json(
            { error: "Unable to save the response." },
            { status: 500 }
        );
    }
}
