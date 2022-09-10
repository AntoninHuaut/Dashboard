import dayjs from 'dayjs';
import { httpErrors } from 'oak';

import { ICreateMail, ILinkTrack, IMail, IPixelTrack, ITrackMailSettings } from '/types/app/trackmail_model.ts';
import * as trackMailRepo from '/repositories/app/trackmail_repository.ts';

export const NUMBER_OF_ITEMS_PER_PAGE = 15;
export const DELAY_SECOND_LOG_PIXEL_TRACK = 5;
export const DELAY_SECOND_LOG_SELF_PIXEL_TRACK = 10;

export const getUserIdByToken = async (token: string): Promise<number> => {
    const userId = await trackMailRepo.getUserIdByToken(token);
    if (!userId) {
        throw new httpErrors.BadRequest('Invalid token');
    }

    return userId;
};

export const getOrCreateToken = async (userId: number): Promise<string> => {
    let token = await trackMailRepo.getTokenByUserId(userId);
    if (!token) {
        token = await trackMailRepo.createUserTrackMail(userId);
    }

    if (!token) {
        throw new httpErrors.InternalServerError('Could not get or generate token');
    }

    return token;
};

export const resetToken = async (userId: number): Promise<string> => {
    const token = await trackMailRepo.resetToken(userId);
    if (!token) {
        throw new httpErrors.InternalServerError('Could not reset and get token');
    }

    return token;
};

export const getSettings = async (userId: number): Promise<ITrackMailSettings> => {
    const settings = await trackMailRepo.getSettings(userId);
    if (!settings) {
        throw new httpErrors.InternalServerError('Could not get settings');
    }

    return settings;
};

export const updateSettings = async (userId: number, newSettings: ITrackMailSettings): Promise<boolean> => {
    return await trackMailRepo.updateSettings(userId, newSettings.log_email_from, newSettings.log_email_to, newSettings.log_subject);
};

export const createMail = async (userId: number, body: ICreateMail): Promise<IMail> => {
    const userSettings: ITrackMailSettings = await getSettings(userId);
    if (!userSettings.log_email_from) body.email_from = '-';
    if (!userSettings.log_email_to) body.email_to = ['-'];
    if (!userSettings.log_subject) body.subject = '-';

    const mail = await trackMailRepo.insertMail(userId, body);
    if (!mail) {
        throw new httpErrors.InternalServerError('Could not create mail');
    }

    return mail;
};

export const deleteMail = async (userId: number, emailId: string): Promise<boolean> => {
    const testUser = await trackMailRepo.getMailById(userId, emailId);
    if (!testUser) {
        throw new httpErrors.NotFound('Email not found');
    }

    return await trackMailRepo.deleteMail(userId, emailId);
};

export const getMailsCount = async (userId: number): Promise<number> => {
    const result = await trackMailRepo.getMailsCount(userId);
    if (result == undefined) {
        throw new httpErrors.InternalServerError('Could not get mails count');
    }

    return result;
};

export const getMails = async (userId: number, page: number): Promise<IMail[]> => {
    const result = await trackMailRepo.getMails(userId, page, NUMBER_OF_ITEMS_PER_PAGE);
    if (!result) {
        throw new httpErrors.InternalServerError('Could not get mails');
    }

    return result;
};

export const getMailById = async (userId: number, emailId: string): Promise<IMail> => {
    const result = await trackMailRepo.getMailById(userId, emailId);
    if (!result) {
        throw new httpErrors.InternalServerError('Could not get mail');
    }

    return result;
};

export const pixelTrack = async (emailId: string, userIp: string): Promise<boolean> => {
    const mailCreated = await trackMailRepo.getMailCreationDateById(emailId);
    if (!mailCreated) {
        throw new httpErrors.BadRequest('Email not found');
    }

    // Prevent selftracking when mail is sent by the TrackMail extension
    const dateWithShift = dayjs(mailCreated).add(DELAY_SECOND_LOG_PIXEL_TRACK, 'second');
    if (dateWithShift.isBefore(dayjs())) {
        return await trackMailRepo.pixelTrack(emailId, userIp);
    }

    return false;
};

export const linkTrack = async (emailId: string, userIp: string, linkUrl: string): Promise<boolean> => {
    const isMailExist = await trackMailRepo.existMailById(emailId);
    if (!isMailExist) {
        throw new httpErrors.BadRequest('Email not found');
    }

    return await trackMailRepo.linkTrack(emailId, userIp, linkUrl);
};

export const getLogsTrackCount = async (userId: number, emailId: string): Promise<number> => {
    const result = await trackMailRepo.getLogsTrackCount(userId, emailId);
    if (result == undefined) {
        throw new httpErrors.InternalServerError('Could not get logs track count');
    }

    return result;
};

export const getLogsTrack = async (userId: number, emailId: string, page: number): Promise<(IPixelTrack | ILinkTrack)[]> => {
    const result = await trackMailRepo.getLogsTrack(userId, emailId, page, NUMBER_OF_ITEMS_PER_PAGE);
    if (!result) {
        throw new httpErrors.InternalServerError('Could not get logs track');
    }

    return result;
};

export const deleteSelfTrack = async (userId: number, emailId: string, userIp: string): Promise<boolean> => {
    const testUser = await trackMailRepo.getMailById(userId, emailId);
    if (!testUser) {
        throw new httpErrors.NotFound('Email not found');
    }

    const startDate = dayjs().subtract(DELAY_SECOND_LOG_SELF_PIXEL_TRACK, 'second').toDate();
    const endDate = dayjs().add(DELAY_SECOND_LOG_SELF_PIXEL_TRACK, 'second').toDate();

    return await trackMailRepo.deleteSelfTrack(emailId, userIp, startDate, endDate);
};
