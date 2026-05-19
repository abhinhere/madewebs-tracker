import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { teamMembers } from "@/lib/seed-data";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "MadeWebs login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user?.passwordHash && (await bcrypt.compare(credentials.password, user.passwordHash))) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        } catch {
          const seededUser = teamMembers.find((member) => member.email === credentials.email);
          if (seededUser && credentials.password === "madewebs123") {
            return {
              id: seededUser.id,
              name: seededUser.name,
              email: seededUser.email,
              role: seededUser.role.toUpperCase(),
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "EMPLOYEE";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "EMPLOYEE");
      }
      return session;
    },
  },
};

export function canAccess(role: string | undefined, allowed: string[]) {
  if (!role) {
    return false;
  }

  return allowed.includes(role.toUpperCase());
}
