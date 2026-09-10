import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();

          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase(),
          }).select("+password");

          if (!user || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );

          if (!isPasswordValid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth");

      if (isPublicRoute) return true;

      if (!isLoggedIn) return false;

      return true;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
            });
          } else if (!existingUser.image && user.image) {
            await User.findByIdAndUpdate(existingUser._id, {
              image: user.image,
            });
          }
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        if (user.id) {
          try {
            await connectDB();
            const dbUser = await User.findById(user.id);
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.name = dbUser.name;
              token.email = dbUser.email;
              token.image = dbUser.image;
            }
          } catch (error) {
            console.error("JWT callback error:", error);
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
