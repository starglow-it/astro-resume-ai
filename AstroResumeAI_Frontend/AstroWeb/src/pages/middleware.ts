// pages/_middleware.js
import { NextRequest,NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token');

    console.log(token);

    console.log('pathname', req.nextUrl.pathname)

    // Assuming '/login' is your login route and '/protected' is a protected route
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}
