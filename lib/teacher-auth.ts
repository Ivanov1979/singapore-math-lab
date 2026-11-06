import { createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "teacher_session";
const SESSION_DURATION = "2h";

function sessionKey() {
    const secret = process.env.TEACHER_SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("TEACHER_SESSION_SECRET is not configured");
    }
    return createHash("sha256").update(secret).digest();
}

export function verifyTeacherCredentials(
    username: string,
    password: string
): boolean {
    const expectedUsername = process.env.TEACHER_USERNAME;
    const expectedHash = process.env.TEACHER_PASSWORD_HASH;

    if (!expectedUsername || !expectedHash || !/^[a-f0-9]{128}$/.test(expectedHash)) {
        return false;
    }

    const calculatedHash = scryptSync(
        password,
        "singapore-teacher-v1",
        64
    );

    const storedHash = Buffer.from(expectedHash, "hex");

    return (
        username === expectedUsername &&
        timingSafeEqual(calculatedHash, storedHash)
    );
}

export async function createTeacherSession() {
    const token = await new SignJWT({ role: "teacher" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(SESSION_DURATION)
        .sign(sessionKey());

    (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 2,
    });
}

export async function isTeacherAuthenticated(): Promise<boolean> {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return false;

    try {
        const { payload } = await jwtVerify(token, sessionKey(), {
            algorithms: ["HS256"],
        });
        return payload.role === "teacher";
    } catch {
        return false;
    }
}

export async function deleteTeacherSession() {
    (await cookies()).delete(COOKIE_NAME);
}
