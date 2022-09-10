export enum RouteEnum {
    AUTH = 'auth',
    USER = 'user',
    APP_TRACKMAIL = 'app/trackmail',
}

export const API_ROUTE = '/api/v1';
export const API_ROUTE_APP_TRACKMAIL = `${API_ROUTE}/${RouteEnum.APP_TRACKMAIL}`;
