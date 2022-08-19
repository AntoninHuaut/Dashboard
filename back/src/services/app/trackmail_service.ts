import { httpErrors } from 'oak';

import { ICreateMail, IMail, ITrackMailSettings } from '../../types/app/trackmail_model.ts';
import * as trackMailRepo from '/repositories/app/trackmail_repository.ts';

export const NUMBER_OF_MAILS_PER_PAGE = 15;

export const getOrCreateToken = async (userId: number): Promise<string> => {
    let token = await trackMailRepo.getToken(userId);
    if (!token) {
        token = await trackMailRepo.insertTokenForUserId(userId);
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
        throw new httpErrors.InternalServerError('Could not get token');
    }

    return settings;
};

export const updateSettings = async (userId: number, newSettings: ITrackMailSettings): Promise<boolean> => {
    return await trackMailRepo.updateSettings(userId, newSettings.log_email_from, newSettings.log_email_to, newSettings.log_subject);
};

export const createMail = async (userId: number, body: ICreateMail): Promise<IMail> => {
    const mail = await trackMailRepo.insertMail(userId, body);
    if (!mail) {
        throw new httpErrors.InternalServerError('Could not create mail');
    }

    return mail;
};

export const getMailsCount = async (userId: number): Promise<number> => {
    const result = await trackMailRepo.getMailsCount(userId);
    if (!result) {
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
