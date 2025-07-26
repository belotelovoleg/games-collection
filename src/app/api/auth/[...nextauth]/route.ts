import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // If user is signing in with Google, create them in DB if not exists
      if (account && account.provider === 'google') {
        // Only create if not already present
        let dbUser = await prisma.user.findUnique({
          where: { email: token.email || profile?.email },
        });
        if (!dbUser && profile?.email) {
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email,
              password: '', // No password for Google users
              role: 'USER',
            },
          });
        }
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.email = dbUser.email;
          token.name = dbUser.name;
        }
      } else if (user) {
        token.role = user.role;
      }

      // Validate user exists in database during JWT processing
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { id: true }
          });
          if (!dbUser) {
            console.log('User not found in database during JWT validation:', token.sub);
            // Return empty token to invalidate
            return {};
          }
        } catch (error) {
          console.error('Error validating user during JWT:', error);
          return {};
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/en/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
