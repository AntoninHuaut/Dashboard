export enum UserRole {
    USER = 'USER',
    ADMIN = ' ADMIN',
}

export interface IUser {
    id: number;
    email: string;
    username: string;
    roles: string[];
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export type ILoginResponse = IUser;

export interface IUpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IRegisterRequest {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}
