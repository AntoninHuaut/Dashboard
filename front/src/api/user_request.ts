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

export const deleteRequest = (userId: number) => {
    return {
        url: `${URL_API_URL}/${userId}`,
        options: mergeFetchOptions({
            method: HttpMethod.DELETE,
        }),
    };
};
