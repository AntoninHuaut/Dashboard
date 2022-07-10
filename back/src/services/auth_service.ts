import { httpErrors } from 'oak';
import * as userRepo from '/repositories/user_repository.ts';
import { User } from '/types/user_model.ts';
import { GeneratedToken, JWTUser } from '/types/auth_model.ts';
import { compare } from '/utils/hash_helper.ts';
import { getAuthToken, getJwtPayload, getRefreshToken } from '/utils/jwt_helper.ts';

export const loginUser = async (email: string, password: string): Promise<GeneratedToken> => {
    const user: User | null = await userRepo.getUserByEmail(email);

    if (user && user.is_active) {
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
        const payload: JWTUser | null = await getJwtPayload(token);
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
