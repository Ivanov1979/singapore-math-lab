import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isTeacherAuthenticated } from "@/lib/teacher-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const setting = await db.classroomSetting.findUnique({
            where: { id: "main" },
            select: { isOpen: true },
        });

        return NextResponse.json(
            { isOpen: setting?.isOpen ?? false },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("CLASSROOM STATUS ERROR:", error);
        return NextResponse.json(
            { error: "No se pudo consultar el estado." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    if (!(await isTeacherAuthenticated())) {
        return NextResponse.json(
            { error: "Acceso docente no autorizado." },
            { status: 401 }
        );
    }

    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin) {
        return NextResponse.json(
            { error: "Origen no autorizado." },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();

        if (typeof body.isOpen !== "boolean") {
            return NextResponse.json(
                { error: "Estado inválido." },
                { status: 400 }
            );
        }

        const setting = await db.classroomSetting.upsert({
            where: { id: "main" },
            update: { isOpen: body.isOpen },
            create: { id: "main", isOpen: body.isOpen },
        });

        return NextResponse.json(
            { isOpen: setting.isOpen },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("CLASSROOM UPDATE ERROR:", error);
        return NextResponse.json(
            { error: "No se pudo actualizar el estado." },
            { status: 500 }
        );
    }
}
