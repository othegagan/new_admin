import NextAuth, { AuthError, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export class CustomAuthError extends AuthError {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.stack = undefined;
    }
}

export const authConfig: NextAuthConfig = {
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/sign-in'
    },
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {},
                password: {},
                firebaseToken: {}
            },
            async authorize(credentials) {
                try {
                    const { email, password, firebaseToken } = credentials;

                    return {
                        iduser: 1,
                        email: 'gagan@gmail.com',
                        name: 'gagan',
                        isactive: true,
                        employee: true,
                        vehicleowner: true,
                        updateddate: '2023-03-01 12:00:00',
                        userimage: null,
                        userRole: 'Host',
                        channelName: 'Bundee',
                        bundeeToken: '1234567890'
                    };
                } catch (error: any) {
                    throw new CustomAuthError(error.message);
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.iduser = user.iduser;
                token.email = user.email;
                token.name = user.name;
                token.isactive = user.isactive;
                token.employee = user.employee;
                token.vehicleowner = user.vehicleowner;
                token.updateddate = user.updateddate;
                token.userimage = user.userimage;
                token.userRole = user.userRole;
                token.channelName = user.channelName;
            }
            if (trigger === 'update' && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                //@ts-ignore
                session = { ...session, ...token };
            }
            return session;
        }
    },
    cookies: {
        sessionToken: {
            name: 'mybudee-host-session',
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            }
        }
    }
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
