export enum UserRole {
    'USER' = 'USER',
    'ADMIN' = 'ADMIN',
}

export const UserRoles = [UserRole.ADMIN, UserRole.USER];

export interface ContextUser {
    id: number;
    email: string;
    username: string;
    roles: UserRole[];
}

export interface User extends ContextUser {
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateUser {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

interface IUpdateUserPassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface IUpdateUserEmail {
    email: string;
}

interface IUpdateUserUsername {
    username: string;
}

export type IUpdateUser = IUpdateUserPassword | IUpdateUserEmail | IUpdateUserUsername;
