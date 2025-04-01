import NextAuth from "next-auth";
import { authOptions } from "./authOption";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
