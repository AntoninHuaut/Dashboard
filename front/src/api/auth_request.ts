import { ILoginRequest, IVerifyRequest } from '../types/LoginType';
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

export const loginRequest = (loginForm: ILoginRequest, captcha: string) => {
    return {
        url: `${AUTH_API_URL}/login`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({ ...loginForm, captcha }),
        }),
    };
};

export const verifyRequest = (verifyForm: IVerifyRequest, captcha: string) => {
    return {
        url: `${AUTH_API_URL}/verify`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({ ...verifyForm, captcha }),
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
