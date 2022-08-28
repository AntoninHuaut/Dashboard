export interface ITrackMailTokenResponse {
    token: string;
}

export interface ITrackMailSettings {
    log_email_from: boolean;
    log_email_to: boolean;
    log_subject: boolean;
}

export interface IPagination {
    numberPerPage: number;
    offset: number;
    page: number;
    total: number;
}

export interface IMailResponse {
    data: IMailExtended[];
    pagination: IPagination;
}

export interface IMailExtended {
    user_id: number;
    email_id: string;

    email_from: string;
    email_to: string[];
    subject: string;
    created: Date;

    pixelTrackCount: number;
}
