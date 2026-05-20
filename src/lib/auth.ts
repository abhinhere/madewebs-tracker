import type { NextAuthOptions } from "next-auth";
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
      name: "MadeWebs login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();

        // 1. Auto-provision or authorize main admin
        if (email === "abhin@madewebs.local" && credentials.password === "Abhin2004#") {
          let admin = await prisma.user.findUnique({ where: { email } });
          const passwordHash = await bcrypt.hash("Abhin2004#", 10);
          if (!admin) {
            admin = await prisma.user.create({
              data: {
                name: "Abhin",
                email,
                role: "ADMIN",
                position: "Founder & Marketing Manager",
                passwordHash,
                plainPassword: "Abhin2004#",
              },
            });
          } else {
            // Update the passwordHash dynamically in case the user was previously seeded with another password.
            admin = await prisma.user.update({
              where: { email },
              data: { passwordHash, plainPassword: "Abhin2004#" },
            });
          }
          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          };
        }

        // 2. Standard DB check for other employees/managers
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: "insensitive",
              },
            },
          });

          if (user?.passwordHash && (await bcrypt.compare(credentials.password.trim(), user.passwordHash))) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        } catch (err) {
          console.error("Auth database query error:", err);
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
