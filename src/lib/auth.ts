import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "MadeWebs login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
       async authorize(credentials) {
        console.log("[AUTH] Authorize called with email:", credentials?.email);
        if (!credentials?.email || !credentials.password) {
          console.log("[AUTH] Missing email or password");
          return null;
        }

        const email = credentials.email.toLowerCase();

        // 1. Auto-provision or authorize main admin
        if (email === "abhin@madewebs.local" && credentials.password === "Abhin2004#") {
          console.log("[AUTH] Admin auto-provision flow triggered");
          try {
            let admin = await prisma.user.findUnique({ where: { email } });
            if (!admin) {
              console.log("[AUTH] Admin user not found, creating admin...");
              const passwordHash = await bcrypt.hash("Abhin2004#", 10);
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
            }
            console.log("[AUTH] Admin authorized successfully");
            return {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: admin.role,
            };
          } catch (e) {
            console.error("[AUTH] Error in admin flow:", e);
          }
        }

        // 2. Standard DB check for other employees/managers
        console.log("[AUTH] Standard DB check flow triggered");
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: "insensitive",
              },
            },
          });

          console.log("[AUTH] User found in DB:", user ? user.email : "none");

          if (user?.passwordHash) {
            const match = await bcrypt.compare(credentials.password.trim(), user.passwordHash);
            console.log("[AUTH] Password match result:", match);
            if (match) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          } else {
            console.log("[AUTH] User does not have a password hash");
          }
        } catch (err) {
          console.error("[AUTH] Auth database query error:", err);
        }

        console.log("[AUTH] Authorization failed (returning null)");
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
