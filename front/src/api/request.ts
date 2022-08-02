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

const getContentTypeHeader = (options: RequestInit): RequestInit => {
    if (options.body) return { headers: { 'Content-Type': 'application/json' } };
    return {};
};

export const mergeFetchOptions = (options: RequestInit): RequestInit => {
    return {
        ...options,
        ...getContentTypeHeader(options),
        credentials: 'include',
    };
};
