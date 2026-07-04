import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const rol = req.nextauth.token?.rol;

    if (pathname.startsWith("/admin") && rol !== "administrador") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      rol === "administrador" &&
      ["/dashboard", "/tareas", "/proyectos", "/calendario", "/planes", "/soporte"].some((p) =>
        pathname.startsWith(p)
      )
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tareas/:path*",
    "/proyectos/:path*",
    "/calendario/:path*",
    "/planes/:path*",
    "/soporte/:path*",
    "/admin/:path*",
  ],
};
