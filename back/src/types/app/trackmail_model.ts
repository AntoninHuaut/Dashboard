export interface ICreateMail {
    email_from: string;
    email_to: string[];
    subject: string;
}

export interface IMail {
    user_id: number;
    email_id: string;

    email_from: string;
    email_to: string[];
    subject: string;
    created: Date;
}

export interface ITrackMailSettings {
    log_email_from: boolean;
    log_email_to: boolean;
    log_subject: boolean;
}

export interface IPixelTrack {
    email_id: string;
    user_ip: string;
    log_date: Date;
}

export interface IPagination {
    numberPerPage: number;
    offset: number;
    page: number;
    total: number;
}
