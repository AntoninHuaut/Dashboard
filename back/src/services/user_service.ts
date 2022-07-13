import { httpErrors } from 'oak';

import * as userRepo from '/repositories/user_repository.ts';
import { UserRole, IUpdateUser, ICreateUser } from '/types/user_model.ts';
import { hash, compare } from '/utils/hash_helper.ts';
import { getRegistrationToken } from '/utils/jwt_helper.ts';

const getUsers = async () => {
    return await userRepo.getUsers();
};

const getUserById = async (id: number) => {
    const user = await userRepo.getUserById(id);
    if (!user) {
        throw new httpErrors.NotFound('User not found');
    }

    return user;
};

const getUserByEmail = async (email: string) => {
    const user = await userRepo.getUserByEmail(email);
    if (!user) {
        throw new httpErrors.NotFound('User not found');
    }

    return user;
};

const createUser = async (createUser: ICreateUser) => {
    if (createUser.password !== createUser.confirmPassword) {
        throw new httpErrors.BadRequest("Passwords don't match");
    }

    const testUser = await userRepo.getUserByEmail(createUser.email);
    if (testUser) {
        throw new httpErrors.BadRequest('An account is already associated with this email');
    }

    const hashPassword = await hash(createUser.password);
    const registrationToken = await getRegistrationToken(createUser);

    return await userRepo.createUser(createUser.email, createUser.username, registrationToken.value, hashPassword, [UserRole.USER]);
};

const updateUser = async (id: number, updateUser: IUpdateUser) => {
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

const deleteUser = async (id: number) => {
    const testUser = await userRepo.getUserById(id);
    if (!testUser) {
        throw new httpErrors.NotFound('User not found');
    }

    return await userRepo.deleteUser(id);
};

export { createUser, deleteUser, getUserByEmail, getUserById, getUsers, updateUser };
