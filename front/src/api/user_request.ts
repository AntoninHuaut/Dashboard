import { IRegisterRequest, IResetPasswordRequest } from '../types/LoginType';
import { BASE_API_URL, HttpMethod, mergeFetchOptions } from './request';

const URL_API_URL = `${BASE_API_URL}/user`;

export const updateRequest = (userId: number, fieldUpdate: { [key: string]: string }) => {
    return {
        url: `${URL_API_URL}/${userId}`,
        options: mergeFetchOptions({
            method: HttpMethod.PUT,
            body: JSON.stringify(fieldUpdate),
        }),
    };
};

export const registerRequest = (body: IRegisterRequest) => {
    return {
        url: `${URL_API_URL}`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify(body),
        }),
    };
};

export const forgotPasswordRequest = (email: string) => {
    return {
        url: `${URL_API_URL}/forgotPassword`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify({
                email,
            }),
        }),
    };
};

export const resetPasswordRequest = (resetPwd: IResetPasswordRequest) => {
    return {
        url: `${URL_API_URL}/resetPassword`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
            body: JSON.stringify(resetPwd),
        }),
    };
};

export const deleteRequest = (userId: number) => {
    return {
        url: `${URL_API_URL}/${userId}`,
        options: mergeFetchOptions({
            method: HttpMethod.DELETE,
        }),
    };
};
