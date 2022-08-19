import { ITrackMailSettings } from '../types/TrackMailType';
import { BASE_API_URL, HttpMethod, mergeFetchOptions } from './request';

const TRACKMAIL_API_URL = `${BASE_API_URL}/app/trackmail`;

export const trackMailTokenRequest = () => {
    return {
        url: `${TRACKMAIL_API_URL}/token`,
        options: mergeFetchOptions({
            method: HttpMethod.GET,
        }),
    };
};

export const resetTrackMailTokenRequest = () => {
    return {
        url: `${TRACKMAIL_API_URL}/token`,
        options: mergeFetchOptions({
            method: HttpMethod.POST,
        }),
    };
};

export const trackMailSettingsRequest = (token: string) => {
    return {
        url: `${TRACKMAIL_API_URL}/settings`,
        options: mergeFetchOptions({
            method: HttpMethod.GET,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    };
};

export const updateTrackMailSettingsRequest = (newSettings: ITrackMailSettings, token: string) => {
    return {
        url: `${TRACKMAIL_API_URL}/settings`,
        options: mergeFetchOptions({
            method: HttpMethod.PUT,
            body: JSON.stringify(newSettings),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    };
};

export const mailsRequest = (targetPage: number, token: string) => {
    return {
        url: `${TRACKMAIL_API_URL}/mail/${targetPage}`,
        options: mergeFetchOptions({
            method: HttpMethod.GET,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    };
};
