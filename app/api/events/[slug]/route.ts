import { Event, IEvent } from "@/databases";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";


type RouteParams = {
    params: Promise<{
        slug: string;
    }>
}


export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        await connectDB();
        const { slug } = await params;

        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing slug paramater' },
                { status: 400 }
            )
        }

        const sanitizedSlug = slug.trim().toLowerCase();

        const event = await Event.findOne({ slug: sanitizedSlug }).lean();

        if (!event) {
            return NextResponse.json(
                { message: `Event with slug '${sanitizedSlug}' not found` },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Event fetched successfuly', event },
            { status: 200 }
        )
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching event by slug:', error)
        }

        if (error instanceof Error) {
            if (error.message.includes('MONDODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                )
            }
        }
    }

    return NextResponse.json(
        { message: 'An unexpected error occurred' },
        { status: 500 }
    )
}