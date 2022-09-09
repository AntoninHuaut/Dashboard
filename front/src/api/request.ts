export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const enum HttpMethod {
    CONNECT = 'CONNECT',
    DELETE = 'DELETE',
    GET = 'GET',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
    PATCH = 'PATCH',
    POST = 'POST',
    PUT = 'PUT',
    TRACE = 'TRACE',
}

export interface IRequestParams {
    url: string;
    options: RequestInit;
}

const getContentTypeHeader = (options: RequestInit): RequestInit => {
    if (options.body) return { headers: { ...options.headers, 'Content-Type': 'application/json' } };
    return {};
};

export const mergeFetchOptions = (options: RequestInit, widthCredentials = true): RequestInit => {
    const opts: RequestInit = {
        ...options,
        ...getContentTypeHeader(options),
    };

    if (widthCredentials) return { ...opts, credentials: 'include' };

    return opts;
};
