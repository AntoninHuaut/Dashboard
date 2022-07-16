import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({
    export: true,
    path: `.env.${Deno.env.get('ENV')}`,
});

interface IConfig {
    PORT?: number;
    ENV: string;

    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_DB: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;

    DEFAULT_ADMIN_EMAIL: string;
    DEFAULT_ADMIN_PASSWORD: string;

    JWT_ACCESS_TOKEN_EXP: number;
    JWT_REFRESH_TOKEN_EXP: number;
    TOKEN_EXP: number;

    SMTP_SERVER: string;
    SMTP_FROM: string;
    SMTP_PORT: number;
    SMTP_LOGIN: string;
    SMTP_PASSWORD: string;

    RECAPTCHA_SERVER_SECRET: string;
    MIN_RECAPTCHA_STORE: number;

    BASE_FRONT_URL: string;
}

const strToNumberType = z.string().transform((val, ctx) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Not a number',
        });
    }
    return parsed;
});

const configType = z.object({
    PORT: strToNumberType.optional(),
    ENV: z.string(),

    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: strToNumberType,
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),

    DEFAULT_ADMIN_EMAIL: z.string(),
    DEFAULT_ADMIN_PASSWORD: z.string(),

    JWT_ACCESS_TOKEN_EXP: strToNumberType,
    JWT_REFRESH_TOKEN_EXP: strToNumberType,
    TOKEN_EXP: strToNumberType,

    SMTP_SERVER: z.string(),
    SMTP_FROM: z.string(),
    SMTP_PORT: strToNumberType,
    SMTP_LOGIN: z.string(),
    SMTP_PASSWORD: z.string(),

    RECAPTCHA_SERVER_SECRET: z.string(),
    MIN_RECAPTCHA_STORE: strToNumberType,

    BASE_FRONT_URL: z.string(),
});

export const config: IConfig = configType.parse(Deno.env.toObject());
