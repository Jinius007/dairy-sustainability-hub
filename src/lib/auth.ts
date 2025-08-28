import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Temporary mock authentication for immediate access
        if (credentials.username === 'admin' && credentials.password === 'password') {
          return {
            id: '1',
            name: 'Admin User',
            username: 'admin',
            role: 'ADMIN',
          };
        }
        
        if (credentials.username === 'john' && credentials.password === 'password') {
          return {
            id: '2',
            name: 'John Doe',
            username: 'john',
            role: 'USER',
          };
        }
        
        if (credentials.username === 'jane' && credentials.password === 'password') {
          return {
            id: '3',
            name: 'Jane Smith',
            username: 'jane',
            role: 'USER',
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  // Remove NEXTAUTH_URL requirement by using relative URLs
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};
