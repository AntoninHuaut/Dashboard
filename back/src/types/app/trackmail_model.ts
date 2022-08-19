export interface ICreateMail {
    emailFrom: string;
    emailTo: string[];
    subject: string;
}

export interface IMail {
    emailFrom: string;
    emailTo: string[];
    subject: string;
    created: Date;
}

export interface ITrackMailSettings {
    logEmailFrom: boolean;
    logEmailTo: boolean;
    logSubject: boolean;
}
