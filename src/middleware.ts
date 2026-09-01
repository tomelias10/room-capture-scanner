import { NextRequest, NextResponse } from "next/server";

// Real authentication (HTTP Basic Auth) in front of the private admin
// inbox and its API. "Nobody knows the URL" is not authentication - this
// is a deliberately simple, zero-cost mechanism: set ADMIN_USER and
// ADMIN_PASSWORD in the environment. For anything beyond a single-operator
// setup, swap this for a real auth provider.
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    // Fail closed: without configured credentials, admin stays locked
    // rather than silently open.
    return new NextResponse("Admin is not configured. Set ADMIN_USER and ADMIN_PASSWORD.", {
      status: 503,
    });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = decoded.slice(0, separatorIndex);
    const suppliedPassword = decoded.slice(separatorIndex + 1);
    if (suppliedUser === user && suppliedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
