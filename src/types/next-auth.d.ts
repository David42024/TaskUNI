import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      rol: "estudiante" | "administrador";
    };
  }

  interface User {
    id: string;
    rol: "estudiante" | "administrador";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: "estudiante" | "administrador";
  }
}
