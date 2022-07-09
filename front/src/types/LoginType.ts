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
