import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const allowedEmails =
  process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      return !!email && allowedEmails.includes(email);
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};