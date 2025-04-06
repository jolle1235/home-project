import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, account, user }) {
        if (account && user) {
          token.providerAccountId = account.providerAccountId;
        }
        return token;
      },
      async session({ session, token }) {
        if (!session?.user) {
          return session;
        }
        if (token.providerAccountId) {
          session.user.id = token.providerAccountId as string;
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  };