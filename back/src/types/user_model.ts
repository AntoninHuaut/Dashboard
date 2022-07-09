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
