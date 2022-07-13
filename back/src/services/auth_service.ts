import { httpErrors } from 'oak';

import * as userRepo from '/repositories/user_repository.ts';
import { User } from '/types/user_model.ts';
import { GeneratedToken, JWTUser } from '/types/auth_model.ts';
import { compare } from '/utils/hash_helper.ts';
import { getAuthToken, getJWTUser, getRefreshToken } from '/utils/jwt_helper.ts';

export const loginUser = async (email: string, password: string): Promise<GeneratedToken> => {
    const user: User | null = await userRepo.getUserByEmail(email);

    if (user) {
        if (!user.is_active) {
            throw new httpErrors.Unauthorized('Inactive user status');
        }

        const hashPassword = await userRepo.getUserPassword(user.id);

        if (hashPassword) {
            const isValidPassword = await compare(password, hashPassword);

            if (isValidPassword) {
                return {
                    access_token: await getAuthToken(user),
                    refresh_token: await getRefreshToken(user),
                };
            }
        }
    }

    throw new httpErrors.Unauthorized('Wrong credentials');
};

export const refreshToken = async (token: string) => {
    try {
        const payload: JWTUser | null = await getJWTUser(token);
        if (payload) {
            const userId: number = payload.id;
            const user: User | null = await userRepo.getUserById(userId);

            if (user) {
                if (!user.is_active) {
                    throw new httpErrors.Unauthorized('Inactive user status');
                }

                return {
                    access_token: await getAuthToken(user),
                    refresh_token: await getRefreshToken(user),
                };
            }
        }

        throw new Error();
    } catch (_err) {
        throw new httpErrors.Unauthorized('Invalid token');
    }
};

export const verifyUser = async (token: string) => {
    const tokenInfo = await userRepo.getTokenByTokenValueAndType(token, 'registration');
    if (!tokenInfo) throw new httpErrors.Unauthorized('Invalid token');

    const now = new Date();
    if (now > tokenInfo.exp) {
        await userRepo.deleteUserByRegistrationToken(token);
        throw new httpErrors.Unauthorized('Token expired');
    }

    return await userRepo.setVerifiedUser(token);
};
