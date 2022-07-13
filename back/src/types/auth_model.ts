import { id, email, username, rolesStr } from './user_model.ts';

export interface JWTUser {
    id: id;
    email: email;
    username: username;
    rolesStr: rolesStr;
}

export interface JWTRegistrationUser {
    email: email;
    username: username;
}

export interface RefreshToken {
    refresh_token: string;
}

export interface TokenProperty {
    value: string;
    maxAge: number;
}

export interface GeneratedToken {
    access_token: TokenProperty;
    refresh_token: TokenProperty;
}
