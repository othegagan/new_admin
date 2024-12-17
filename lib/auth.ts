import { ROLES } from '@/constants';
import { getBundeeToken, getUserByEmail } from '@/server/user';
import NextAuth, { AuthError, type NextAuthConfig, type User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { checkStringType } from './utils';

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
                    const { email, firebaseToken } = credentials;

                    // Step 1: Fetch Bundee Auth Token
                    const authTokenResponse = await getBundeeToken(firebaseToken as string);
                    if (!authTokenResponse.authToken) {
                        throw new CustomAuthError('Unable to get Bundee Token');
                    }

                    // Step 2: Fetch user details
                    const response = await getUserByEmail(email as string);
                    if (!response.success || !response.data?.userResponse) {
                        throw new CustomAuthError(response.message || 'Unable to get user by email');
                    }

                    const userResponse = response.data.userResponse;

                    // Step 3: Check for inactive accounts
                    if (!userResponse.isactive) {
                        throw new CustomAuthError('Unauthorized: Account is inactive');
                    }

                    // Step 4: Block DRIVER role users
                    if (userResponse.userRole === ROLES.DRIVER) {
                        throw new CustomAuthError('Unauthorized to sign in');
                    }

                    // Step 5: Construct the user object
                    const user: User = {
                        iduser: userResponse.iduser,
                        email: userResponse.email,
                        name: `${userResponse.firstname} ${userResponse.lastname}`.trim(),
                        employee: userResponse.employee,
                        vehicleowner: userResponse.vehicleowner,
                        userimage: checkStringType(userResponse.userimage) === 'url' ? userResponse.userimage : null,
                        userRole: userResponse.userRole,
                        channelName: userResponse.channelName,
                        bundeeToken: authTokenResponse.authToken
                    };

                    return user;
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
                token.employee = user.employee;
                token.vehicleowner = user.vehicleowner;
                token.userimage = user.userimage;
                token.userRole = user.userRole;
                token.channelName = user.channelName;
                token.bundeeToken = user.bundeeToken;
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
