import * as trackMailRepo from '/repositories/app/trackmail_repository.ts';

export const getOrCreateTokenByUserId = async (id: number): Promise<string | null> => {
    let token = await trackMailRepo.getTokenByUserId(id);
    if (!token) {
        token = await trackMailRepo.insertTokenForUserId(id);
    }

    return token;
};

export const resetTokenByUserId = async (id: number): Promise<string | null> => {
    return await trackMailRepo.resetTokenByUserId(id);
};
