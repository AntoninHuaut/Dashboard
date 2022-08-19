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
    totalMail: number;
}

export interface IMailResponse {
    data: IMail[];
    pagination: IPagination;
}

export interface IMail {
    user_id: number;
    email_id: string;

    email_from: string;
    email_to: string[];
    subject: string;
    created: Date;
}
