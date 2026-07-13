import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rutasEstudiante = [
  "/dashboard",
  "/tareas",
  "/cursos",
  "/proyectos",
  "/calendario",
  "/recordatorios",
  "/productividad",
  "/plan",
  "/soporte",
  "/configuracion",
  "/archivos",
];

const rutasAdmin = ["/admin"];

const apiEstudiante = [
  "/api/tareas",
  "/api/cursos",
  "/api/proyectos",
  "/api/calendario",
  "/api/recordatorios",
  "/api/productividad",
  "/api/soporte",
  "/api/archivos",
];

const apiAdmin = ["/api/admin"];

function coincideRuta(pathname: string, ruta: string): boolean {
  return pathname === ruta || pathname.startsWith(`${ruta}/`);
}

function esAlgunaRuta(pathname: string, rutas: string[]): boolean {
  return rutas.some((ruta) => coincideRuta(pathname, ruta));
}

function respuestaNoAutenticado(req: NextRequest, esApi: boolean) {
  if (esApi) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", req.url);
  const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  loginUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(loginUrl);
}

function respuestaProhibida(
  req: NextRequest,
  esApi: boolean,
  redireccion: string
) {
  if (esApi) {
    return NextResponse.json(
      { error: "Acceso denegado" },
      { status: 403 }
    );
  }

  return NextResponse.redirect(new URL(redireccion, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NextAuth debe poder gestionar sus propios endpoints.
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const esApi = pathname.startsWith("/api");

  const esRutaEstudiante =
    esAlgunaRuta(pathname, rutasEstudiante) ||
    esAlgunaRuta(pathname, apiEstudiante);

  const esRutaAdmin =
    esAlgunaRuta(pathname, rutasAdmin) ||
    esAlgunaRuta(pathname, apiAdmin);

  const esRutaAuth =
    pathname === "/login" ||
    pathname === "/registro";

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const estaAutenticado = Boolean(token);
  const rol = token?.rol;

  const esAdministrador = rol === "administrador";
  const esEstudiante = rol === "estudiante";

  // Rechazar tokens con roles desconocidos ANTES de cualquier otra redirección.
  if (estaAutenticado && !esAdministrador && !esEstudiante) {
    if (esApi) {
      return NextResponse.json(
        { error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const response = NextResponse.redirect(
      new URL("/login?error=sesion-invalida", req.url)
    );

    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");

    return response;
  }

  // Evitar que un usuario autenticado vuelva al login o registro.
  if (esRutaAuth && estaAutenticado) {
    return NextResponse.redirect(
      new URL(esAdministrador ? "/admin" : "/dashboard", req.url)
    );
  }

  if (!esRutaEstudiante && !esRutaAdmin) {
    return NextResponse.next();
  }

  if (!estaAutenticado) {
    return respuestaNoAutenticado(req, esApi);
  }

  if (esRutaAdmin && !esAdministrador) {
    return respuestaProhibida(req, esApi, "/dashboard");
  }

  if (esRutaEstudiante && esAdministrador) {
    return respuestaProhibida(req, esApi, "/admin");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/registro",
    "/dashboard/:path*",
    "/tareas/:path*",
    "/cursos/:path*",
    "/proyectos/:path*",
    "/calendario/:path*",
    "/recordatorios/:path*",
    "/productividad/:path*",
    "/plan/:path*",
    "/soporte/:path*",
    "/configuracion/:path*",
    "/archivos/:path*",
    "/admin/:path*",
    "/api/tareas/:path*",
    "/api/cursos/:path*",
    "/api/proyectos/:path*",
    "/api/calendario/:path*",
    "/api/recordatorios/:path*",
    "/api/productividad/:path*",
    "/api/soporte/:path*",
    "/api/archivos/:path*",
    "/api/admin/:path*",
  ],
};
