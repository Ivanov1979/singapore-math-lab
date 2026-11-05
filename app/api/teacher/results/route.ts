
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { MathSkill } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const skills: MathSkill[] = [
    "REPRESENTAR",
    "MODELAR",
    "RESOLVER_PROBLEMAS",
    "ARGUMENTAR_COMUNICAR",
];

type RecordScore = {
    activityKey: string;
    skill: MathSkill;
    points: number | null;
    maxPoints: number;
};

function summarize(records: RecordScore[]) {
    return skills.map((skill) => {
        const matching = records.filter((r) => r.skill === skill);
        const graded = matching.filter((r) => r.points !== null);
        const points = graded.reduce((sum, r) => sum + (r.points ?? 0), 0);
        const maxPoints = graded.reduce((sum, r) => sum + r.maxPoints, 0);

        return {
            skill,
            points,
            maxPoints,
            responses: matching.length,
            pending: matching.length - graded.length,
            percentage:
                maxPoints > 0
                    ? Math.round((points / maxPoints) * 100)
                    : null,
        };
    });
}

export async function GET() {
    if (
        process.env.NODE_ENV !== "development" ||
        process.env.ENABLE_ASSESSMENT_TEST_API !== "true"
    ) {
        return NextResponse.json(
            { error: "Resultados no disponibles." },
            { status: 403 }
        );
    }

    try {
        const [students, tickets] = await Promise.all([
            db.student.findMany({
                select: {
                    id: true,
                    code: true,
                    firstName: true,
                    lastName: true,
                    grade: true,
                    assessmentResponses: {
                        select: {
                            activityKey: true,
                            skill: true,
                            points: true,
                            maxPoints: true,
                        },
                    },
                },
                orderBy: [
                    { lastName: "asc" },
                    { firstName: "asc" },
                ],
            }),
            db.exitTicket.findMany({
                select: {
                    studentId: true,
                    activityId: true,
                    isCorrect: true,
                },
            }),
        ]);

        const ticketsByStudent = new Map<
            string,
            typeof tickets
        >();

        for (const ticket of tickets) {
            const existing = ticketsByStudent.get(ticket.studentId) ?? [];
            existing.push(ticket);
            ticketsByStudent.set(ticket.studentId, existing);
        }

        const studentResults = students
            .filter(
                (student) =>
                    student.assessmentResponses.length > 0 ||
                    (ticketsByStudent.get(student.id)?.length ?? 0) > 0
            )
            .map((student) => {
                const studentTickets = ticketsByStudent.get(student.id) ?? [];

                return {
                    id: student.id,
                    code: student.code,
                    name:
                        [student.firstName, student.lastName]
                            .filter(Boolean)
                            .join(" ") || student.code,
                    grade: student.grade,
                    activities: {
                        ludo: summarize(
                            student.assessmentResponses.filter(
                                (r) => r.activityKey === "ludo-matematico"
                            )
                        ),
                        singapore: summarize(
                            student.assessmentResponses.filter(
                                (r) => r.activityKey !== "ludo-matematico"
                            )
                        ),
                    },
                    tickets: {
                        experiencia2: {
                            submitted: studentTickets.filter(
                                (t) => t.activityId === "experiencia-2"
                            ).length,
                            correct: studentTickets.filter(
                                (t) =>
                                    t.activityId === "experiencia-2" &&
                                    t.isCorrect
                            ).length,
                        },
                        experiencia3: {
                            submitted: studentTickets.filter(
                                (t) => t.activityId === "experiencia-3"
                            ).length,
                            correct: studentTickets.filter(
                                (t) =>
                                    t.activityId === "experiencia-3" &&
                                    t.isCorrect
                            ).length,
                        },
                    },
                };
            });

        const allResponses = students.flatMap(
            (student) => student.assessmentResponses
        );

        const countTickets = (activityId: string) => {
            const matching = tickets.filter(
                (ticket) => ticket.activityId === activityId
            );

            return {
                submitted: matching.length,
                correct: matching.filter((ticket) => ticket.isCorrect).length,
            };
        };

        return NextResponse.json({
            global: {
                ludo: summarize(
                    allResponses.filter(
                        (r) => r.activityKey === "ludo-matematico"
                    )
                ),
                singapore: summarize(
                    allResponses.filter(
                        (r) => r.activityKey !== "ludo-matematico"
                    )
                ),
                tickets: {
                    experiencia2: countTickets("experiencia-2"),
                    experiencia3: countTickets("experiencia-3"),
                },
            },
            students: studentResults,
        });
    } catch (error) {
        console.error("TEACHER RESULTS ERROR:", error);

        return NextResponse.json(
            { error: "No se pudieron cargar los resultados." },
            { status: 500 }
        );
    }
}
