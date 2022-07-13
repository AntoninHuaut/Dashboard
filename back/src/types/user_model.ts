export enum UserRole {
    'USER' = 'USER',
    'ADMIN' = 'ADMIN',
}

export const UserRoles = [UserRole.ADMIN, UserRole.USER];

export type id = number;
export type email = string;
export type username = string;
export type roles = UserRole[];
export type rolesStr = string;
export type is_active = boolean;
export type created_at = Date;
export type updated_at = Date;
export type password = string;

export interface ContextUser {
    id: id;
    email: email;
    username: username;
    roles: roles;
}

export interface User extends ContextUser {
    is_active: is_active;
    created_at: created_at;
    updated_at: updated_at;
}

export interface ICreateUser {
    email: email;
    username: username;
    password: password;
    confirmPassword: password;
}

export interface IForgotUserPassword {
    email: email;
}

export interface IResetUserPassword {
    token: string;
    newPassword: password;
    confirmPassword: password;
}

interface IUpdateUserPassword {
    currentPassword: password;
    newPassword: password;
    confirmPassword: password;
}

interface IUpdateUserEmail {
    email: email;
}

interface IUpdateUserUsername {
    username: username;
}

export type IUpdateUser = IUpdateUserPassword | IUpdateUserEmail | IUpdateUserUsername;
