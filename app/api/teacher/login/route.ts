import { NextRequest, NextResponse } from "next/server";
import {
    createTeacherSession,
    verifyTeacherCredentials,
} from "@/lib/teacher-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (!origin || origin !== expectedOrigin) {
        return NextResponse.json(
            { error: "Origen no autorizado." },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();

        if (
            typeof body.username !== "string" ||
            typeof body.password !== "string" ||
            body.username.length > 100 ||
            body.password.length > 256
        ) {
            return NextResponse.json(
                { error: "Credenciales inválidas." },
                { status: 400 }
            );
        }

        const valid = verifyTeacherCredentials(
            body.username,
            body.password
        );

        if (!valid) {
            return NextResponse.json(
                { error: "Usuario o contraseña incorrectos." },
                { status: 401 }
            );
        }

        await createTeacherSession();

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("TEACHER LOGIN ERROR:", error);

        return NextResponse.json(
            { error: "No se pudo iniciar sesión." },
            { status: 500 }
        );
    }
}
