import { ICreateMail, IMail } from '../../types/app/trackmail_model.ts';
import * as trackMailRepo from '/repositories/app/trackmail_repository.ts';
import { httpErrors } from 'oak';

export const NUMBER_OF_MAILS_PER_PAGE = 15;

export const getOrCreateTokenByUserId = async (userId: number): Promise<string | null> => {
    let token = await trackMailRepo.getTokenByUserId(userId);
    if (!token) {
        token = await trackMailRepo.insertTokenForUserId(userId);
    }

    return token;
};

export const resetTokenByUserId = async (userId: number): Promise<string | null> => {
    return await trackMailRepo.resetTokenByUserId(userId);
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
