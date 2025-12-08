import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin, TABLES } from "@/lib/supabase";
import type { StudentUser } from "@nclex/shared-api-types";
import { getUserRole } from "@nclex/shared-api-types";

async function updateUserLastLogin(userId: string) {
    try {
        await supabaseAdmin
            .from(TABLES.USERS)
            .update({ updated_at: new Date().toISOString() })
            .eq('id', userId);
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
                    console.log('[Auth] Missing credentials');
                    return null;
                }

                console.log('[Auth] Attempting login for:', credentials.email.toLowerCase());

                // Query user from Supabase
                const { data: user, error } = await supabaseAdmin
                    .from(TABLES.USERS)
                    .select('*')
                    .eq('email', credentials.email.toLowerCase())
                    .single();

                if (error) {
                    console.log('[Auth] Supabase error:', error.message);
                    return null;
                }

                if (!user) {
                    console.log('[Auth] User not found');
                    return null;
                }

                console.log('[Auth] User found:', user.email, 'ID:', user.id);

                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.password_hash
                );

                console.log('[Auth] Password valid:', isValidPassword);

                if (!isValidPassword) {
                    return null;
                }

                // Update last login
                await updateUserLastLogin(user.id);

                // Map database columns to app format
                const subscriptionStatus = user.subscription_status as StudentUser['subscriptionStatus'];

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    subscriptionStatus,
                    role: getUserRole(subscriptionStatus),
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
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
