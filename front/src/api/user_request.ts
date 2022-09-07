import { IFogotPasswordRequest, IRegisterRequest, IResetPasswordRequest } from '../types/LoginType';
import { BASE_API_URL, HttpMethod, mergeFetchOptions } from './request';

const USER_API_URL = `${BASE_API_URL}/user`;

export const updateRequest = (userId: number, fieldUpdate: { [key: string]: string }, captcha: string) => {
    return {
        url: `${USER_API_URL}/${userId}`,
        options: mergeFetchOptions({
            method: HttpMethod.PUT,
            body: JSON.stringify({ ...fieldUpdate, captcha }),
        }),
    };
};

export const registerRequest = (registerForm: IRegisterRequest, captcha: string) => {
    return {
        url: `${USER_API_URL}`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({ ...registerForm, captcha }),
        }),
    };
};

export const forgotPasswordRequest = (forgotPasswordForm: IFogotPasswordRequest, captcha: string) => {
    return {
        url: `${USER_API_URL}/forgotPassword`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({ ...forgotPasswordForm, captcha }),
        }),
    };
};

export const resetPasswordRequest = (resetPasswordForm: IResetPasswordRequest, captcha: string) => {
    return {
        url: `${USER_API_URL}/resetPassword`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({ ...resetPasswordForm, captcha }),
        }),
    };
};

export const deleteRequest = (userId: number, captcha: string) => {
    return {
        url: `${USER_API_URL}/${userId}?captcha=${captcha}`,
        options: mergeFetchOptions({
            method: HttpMethod.DELETE,
        }),
    };
};

export const usersRequest = (targetPage: number) => {
    return {
        url: `${USER_API_URL}/${targetPage}`,
        options: mergeFetchOptions({
            method: HttpMethod.GET,
        }),
    };
};
