import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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
