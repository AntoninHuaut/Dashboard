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
