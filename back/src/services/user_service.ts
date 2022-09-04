import { httpErrors } from 'oak';

import { sendRegistrationEmail, sendResetPasswordEmail } from '/external/smtp.ts';
import * as userRepo from '/repositories/user_repository.ts';
import * as tokenRepo from '/repositories/user_token_repository.ts';
import { ICreateUser, IResetUserPassword, IUpdateUser, UserRole, IUser } from '/types/user_model.ts';
import { createToken } from '/utils/db_helper.ts';
import { compare, hash } from '/utils/hash_helper.ts';

export const NUMBER_OF_USERS_PER_PAGE = 15;

export const getUsers = async (page: number): Promise<IUser[]> => {
    const users = await userRepo.getUsers(page, NUMBER_OF_USERS_PER_PAGE);
    if (!users) {
        throw new httpErrors.InternalServerError('Could not get users');
    }

    return users;
};

export const getUsersCount = async (): Promise<number> => {
    const result = await userRepo.getUsersCount();
    if (result == undefined) {
        throw new httpErrors.InternalServerError('Could not get users count');
    }

    return result;
};

export const getUserById = async (id: number) => {
    const user = await userRepo.getUserById(id);
    if (!user) {
        throw new httpErrors.NotFound('User not found');
    }

    return user;
};

export const getUserByEmail = async (email: string) => {
    const user = await userRepo.getUserByEmail(email);
    if (!user) {
        throw new httpErrors.NotFound('User not found');
    }

    return user;
};

export const createUser = async (createUserForm: ICreateUser) => {
    if (createUserForm.password !== createUserForm.confirmPassword) {
        throw new httpErrors.BadRequest("Passwords don't match");
    }

    const testUser = await userRepo.getUserByEmail(createUserForm.email);
    if (testUser) {
        throw new httpErrors.BadRequest('An account is already associated with this email');
    }

    const hashPassword = await hash(createUserForm.password);
    const registrationToken = createToken();

    const createUser = await userRepo.createUser(createUserForm.email, createUserForm.username, registrationToken, hashPassword, [UserRole.USER]);

    await sendRegistrationEmail(createUserForm.email, registrationToken.value);
    return createUser;
};

export const askForgotPassword = async (email: string) => {
    const user = await userRepo.getUserByEmail(email);
    if (!user) {
        throw new httpErrors.NotFound('User not found');
    }

    const forgotPasswordToken = createToken();
    await userRepo.setForgotPasswordToken(user.id, forgotPasswordToken);

    await sendResetPasswordEmail(email, forgotPasswordToken.value);
};

export const resetPassword = async (resetPasswordForm: IResetUserPassword) => {
    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
        throw new httpErrors.BadRequest("Passwords don't match");
    }

    const tokenInfo = await tokenRepo.getTokenByTokenValueAndType(resetPasswordForm.token, 'forgot_password');
    if (!tokenInfo) throw new httpErrors.Unauthorized('Invalid token');

    const userId = await userRepo.getUserIdByTokenValueAndType(resetPasswordForm.token, 'forgot_password');
    if (!userId) throw new httpErrors.NotFound('User not found');

    const now = new Date();
    if (now > tokenInfo.exp) {
        await userRepo.removeUserTokenId(userId, resetPasswordForm.token, 'forgot_password');
        throw new httpErrors.Unauthorized('Token expired');
    }

    const hashPassword = await hash(resetPasswordForm.newPassword);
    return await userRepo.setResetPassword(userId, resetPasswordForm.token, hashPassword);
};

export const updateUser = async (id: number, updateUser: IUpdateUser) => {
    const hashCurrentPassword = await userRepo.getUserPassword(id);
    if (!hashCurrentPassword) {
        throw new httpErrors.NotFound('User not found');
    }

    if ('currentPassword' in updateUser && 'newPassword' in updateUser && 'confirmPassword' in updateUser) {
        if (updateUser.newPassword !== updateUser.confirmPassword) {
            throw new httpErrors.BadRequest("Passwords don't match");
        }

        const isValidPassword = await compare(updateUser.currentPassword, hashCurrentPassword);
        if (!isValidPassword) {
            throw new httpErrors.BadRequest('Invalid current password');
        }

        const hashNewPassword = await hash(updateUser.newPassword);
        return await userRepo.updateUserPassword(id, hashNewPassword);
    } else if ('email' in updateUser) {
        return await userRepo.updateUserEmail(id, updateUser.email);
    } else if ('username' in updateUser) {
        return await userRepo.updateUserUsername(id, updateUser.username);
    } else {
        throw new httpErrors.BadRequest('Invalid body');
    }
};

export const deleteUser = async (id: number) => {
    const testUser = await userRepo.getUserById(id);
    if (!testUser) {
        throw new httpErrors.NotFound('User not found');
    }

    return await userRepo.deleteUser(id);
};
