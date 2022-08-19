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
