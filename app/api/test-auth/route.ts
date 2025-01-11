import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();
        
        return new NextResponse(
            JSON.stringify({
                userId,
                sessionClaims,
                env: {
                    hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
                    clerk_key_length: process.env.CLERK_SECRET_KEY?.length || 0
                }
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Auth test error:', error);
        return new NextResponse(
            JSON.stringify({ 
                error: "Auth test failed",
                details: error.message 
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}