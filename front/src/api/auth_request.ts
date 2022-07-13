import { ILoginRequest } from '../types/LoginType';
import { BASE_API_URL, HttpMethod, mergeFetchOptions } from './request';

const AUTH_API_URL = `${BASE_API_URL}/auth`;

export const sessionRequest = () => {
    return {
        url: `${AUTH_API_URL}/me`,
        options: mergeFetchOptions({ method: HttpMethod.GET }),
    };
};

export const refreshRequest = () => {
    return {
        url: `${AUTH_API_URL}/refresh`,
        options: mergeFetchOptions({ method: HttpMethod.POST }),
    };
};

export const loginRequest = (loginRequest: ILoginRequest) => {
    return {
        url: `${AUTH_API_URL}/login`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify(loginRequest),
        }),
    };
};

export const verifyRequest = (token: string) => {
    return {
        url: `${AUTH_API_URL}/verify`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({
                token: token,
            }),
        }),
    };
};

export const logoutRequest = () => {
    return {
        url: `${AUTH_API_URL}/logout`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
        }),
    };
};
