import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import type { StudentUser } from "@nclex/shared-api-types";
import { getUserRole } from "@nclex/shared-api-types";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function getUsers(): StudentUser[] {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading users file:", error);
        return [];
    }
}

function updateUserLastLogin(userId: string) {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].lastLoginAt = new Date().toISOString();
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error("Error updating last login:", error);
    }
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const users = getUsers();
                const user = users.find(
                    u => u.email.toLowerCase() === credentials.email.toLowerCase()
                );

                if (!user) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isValidPassword) {
                    return null;
                }

                // Update last login
                updateUserLastLogin(user.id);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    subscriptionStatus: user.subscriptionStatus,
                    role: getUserRole(user.subscriptionStatus),
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.subscriptionStatus = (user as any).subscriptionStatus;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).id = token.id;
                (session.user as any).subscriptionStatus = token.subscriptionStatus;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
});

export { handler as GET, handler as POST };
