import { httpErrors } from 'oak';

import { ICreateMail, IMail, IPixelTrack, ITrackMailSettings } from '/types/app/trackmail_model.ts';
import * as trackMailRepo from '/repositories/app/trackmail_repository.ts';

export const NUMBER_OF_MAILS_PER_PAGE = 15;

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
    const result = await trackMailRepo.getMails(userId, page, NUMBER_OF_MAILS_PER_PAGE);
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
    const isMailExist = await trackMailRepo.existMailById(emailId);
    if (!isMailExist) {
        throw new httpErrors.BadRequest('Invalid email id');
    }

    return await trackMailRepo.pixelTrack(emailId, userIp);
};

export const getPixelTracksCount = async (userId: number, emailId: string): Promise<number> => {
    const result = await trackMailRepo.getPixelTracksCount(userId, emailId);
    if (result == undefined) {
        throw new httpErrors.InternalServerError('Could not get pixel tracks count');
    }

    return result;
};

export const getPixelTracks = async (userId: number, emailId: string, page: number): Promise<IPixelTrack[]> => {
    const result = await trackMailRepo.getPixelTracks(userId, emailId, page, NUMBER_OF_MAILS_PER_PAGE);
    if (!result) {
        throw new httpErrors.InternalServerError('Could not get pixel tracks');
    }

    return result;
};
