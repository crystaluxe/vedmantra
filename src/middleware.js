import { NextResponse } from "next/server";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const auth = request.headers.get("authorization");

    const username = "admin";
    const password = process.env.ADMIN_PASSWORD;

    if (auth) {
      const token = auth.split(" ")[1];
      const [user, pass] = atob(token).split(":");

      if (user === username && pass === password) {
        return NextResponse.next();
      }
    }

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Vedmantra Admin"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};