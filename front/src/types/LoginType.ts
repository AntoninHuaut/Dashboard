export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface IUser {
    id: number;
    email: string;
    username: string;
    roles: string[];
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
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

export interface IFogotPasswordRequest {
    email: string;
}

export interface IVerifyRequest {
    token: string;
}

export interface IResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
