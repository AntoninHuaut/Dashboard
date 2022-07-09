import { httpErrors } from 'oak';
import * as userRepo from '/repositories/user_repository.ts';
import { UserRole, IUpdateUser } from '/types/user_model.ts';
import { hash, compare } from '/utils/hash_helper.ts';

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

const createUser = async (email: string, username: string, password: string) => {
    const testUser = await userRepo.getUserByEmail(email);
    if (testUser) {
        throw new httpErrors.BadRequest('User already exists');
    }

    const hashPassword = await hash(password);

    return await userRepo.createUser(email, username, hashPassword, [UserRole.USER]);
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

        const isValidPassword = compare(updateUser.currentPassword, hashCurrentPassword);
        if (!isValidPassword) {
            throw new httpErrors.BadRequest('Invalid password');
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
