import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const userId = user?.id ?? (token.id as string | undefined);

      if (userId) {
        token.id = userId;

        // Keep couple membership fresh. It is set on sign-in, but a user can
        // create or join a couple afterwards, which would otherwise leave a
        // stale `coupleId: null` in the token until they sign out and back in.
        // Refresh on sign-in, on explicit session updates, and whenever the
        // token still has no couple.
        const needsCoupleRefresh =
          Boolean(user) || trigger === "update" || token.coupleId == null;

        if (needsCoupleRefresh) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { coupleId: true, coupleRole: true },
          });
          token.coupleId = dbUser?.coupleId ?? null;
          token.coupleRole = dbUser?.coupleRole ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.coupleId = token.coupleId as string | null;
        session.user.coupleRole = token.coupleRole as string | null;
      }
      return session;
    },
  },
});
