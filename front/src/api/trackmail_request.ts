import { BASE_API_URL, HttpMethod, mergeFetchOptions } from './request';

const TRACKMAIL_API_URL = `${BASE_API_URL}/app/trackmail`;

export const trackMailToken = () => {
    return {
        url: `${TRACKMAIL_API_URL}/token`,
        options: mergeFetchOptions({
            method: HttpMethod.GET,
        }),
    };
};

export const resetTrackMailToken = () => {
    return {
        url: `${TRACKMAIL_API_URL}/token`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
        }),
    };
};
