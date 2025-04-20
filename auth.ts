import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "./db";
import { Role } from "./db/schemas";
import { users } from "./db/schemas/auth";
import { LoginSchema, UserLoginSchema } from "./lib/schemas/auth/login.schema";
import { verifyPassword } from "./lib/utils/verifyPassword";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      role: Role;
    };
  }
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "InvalidCredentials";
}
class InvalidPasswordError extends CredentialsSignin {
  code = "InvalidPassword";
}
class UserNotFoundError extends CredentialsSignin {
  code = "UserNotFound";
}

// import { hashPassword } from "@/lib/utils/hashPassword";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
        role: {},
      },
      authorize: async (credentials) => {
        let username;
        let password;
        if (credentials.role === Role.USER) {
          const result = UserLoginSchema.safeParse(credentials);

          if (!result.success) {
            throw new InvalidCredentialsError();
          }

          username = result.data.username;
          password = result.data.password;
        }

        if (credentials.role === Role.ADMIN) {
          const result = LoginSchema.safeParse(credentials);

          if (!result.success) {
            throw new InvalidCredentialsError();
          }

          username = result.data.username;
          password = result.data.password;
        }

        const foundUser = await db.query.users.findFirst({
          where: eq(users.username, username as string),
        });

        if (!foundUser) {
          throw new UserNotFoundError();
        }

        const verified = await verifyPassword(
          password as string,
          foundUser.password as string,
          foundUser.salt as string
        );

        if (!verified) {
          throw new InvalidPasswordError();
        }
        // return user object with their profile data
        return {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          username: foundUser.username,
          role: foundUser.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as Role;
      return session;
    },
    async jwt({ token }) {
      const foundUser = await db
        .select()
        .from(users)
        .where(eq(users.id, token.sub as string));

      token.role = foundUser[0].role;

      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
