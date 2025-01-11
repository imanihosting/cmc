import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { role } = body;

        if (!role || !['parent', 'childminder'].includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Update user metadata in Clerk
        try {
            const response = await fetch(
                `https://api.clerk.com/v1/users/${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        public_metadata: { role }
                    })
                }
            );

            if (!response.ok) {
                console.error('Clerk API Error Status:', response.status);
                const errorText = await response.text();
                console.error('Clerk API Error:', errorText);
                
                return NextResponse.json(
                    { error: 'Failed to update role' },
                    { status: 500 }
                );
            }

            const data = await response.json();
            console.log('Role update successful:', data);

            return NextResponse.json({ 
                success: true,
                role: role
            });

        } catch (error) {
            console.error('Clerk API request error:', error);
            return NextResponse.json(
                { error: "Failed to update role" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Role API error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}