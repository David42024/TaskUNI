import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        correo: { label: "Correo", type: "email" },
        contrasena: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) {
          throw new Error("Correo y contraseña son obligatorios");
        }

        const usuario = await prisma.usuario.findUnique({
          where: { correo_norm: credentials.correo.toLowerCase().trim() },
        });

        if (!usuario) {
          throw new Error("Credenciales inválidas");
        }

        if (usuario.estado !== "activo") {
          throw new Error("Tu cuenta se encuentra inactiva o suspendida");
        }

        const contrasenaValida = await bcrypt.compare(
          credentials.contrasena,
          usuario.contrasena_hash
        );

        if (!contrasenaValida) {
          throw new Error("Credenciales inválidas");
        }

        await prisma.usuario.update({
          where: { id_usuario: usuario.id_usuario },
          data: { ultimo_acceso: new Date() },
        });

        return {
          id: usuario.id_usuario,
          name: `${usuario.nombres} ${usuario.apellidos}`,
          email: usuario.correo,
          rol: usuario.rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Usar la URL del request dinámicamente en lugar de NEXTAUTH_URL hardcodeado
  useSecureCookies: process.env.NODE_ENV === "production",
};
