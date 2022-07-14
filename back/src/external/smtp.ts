import { SMTPClient } from 'denomailer';
import * as path from 'path';
import { get } from '/config.ts';

const SMTP_SERVER = get('SMTP_SERVER') ?? '';
const SMTP_FROM = get('SMTP_FROM') ?? '';
const SMTP_PORT = get('SMTP_PORT') ?? '';
const SMTP_LOGIN = get('SMTP_LOGIN') ?? '';
const SMTP_PASSWORD = get('SMTP_PASSWORD') ?? '';

const BASE_FRONT_URL = get('BASE_FRONT_URL');

if (!BASE_FRONT_URL) {
    console.error('Invalid BASE_FRONT_URL');
    Deno.exit(1);
}

if (!SMTP_SERVER || !SMTP_FROM || isNaN(+SMTP_PORT) || !SMTP_LOGIN || !SMTP_PASSWORD) {
    console.error('Invalid SMTP configuration');
    Deno.exit(6);
}

const TEMPLATE_FOLDER = path.dirname(path.fromFileUrl(import.meta.url)) + '/smtp_template';
const TEMPLATES = {
    verifUser: Deno.readTextFileSync(`${TEMPLATE_FOLDER}/verifUser.html`),
    resetPassword: Deno.readTextFileSync(`${TEMPLATE_FOLDER}/resetPassword.html`),
};

async function sendEmail(to: string, subject: string, html: string) {
    const client = new SMTPClient({
        connection: {
            hostname: SMTP_SERVER,
            port: +SMTP_PORT,
            auth: {
                username: SMTP_LOGIN,
                password: SMTP_PASSWORD,
            },
        },
    });

    await client.send({
        from: SMTP_FROM,
        to: to,
        subject: subject,
        content: 'auto',
        html: html,
    });

    await client.close();
}

export async function sendRegistrationEmail(to: string, token: string) {
    const html = `${TEMPLATES.verifUser}`.replace(/{{VERIF_URL}}/g, `${BASE_FRONT_URL}/verify/${token}`);
    await sendEmail(to, 'Verify your email', html);
}

export async function sendResetPasswordEmail(to: string, token: string) {
    const html = `${TEMPLATES.resetPassword}`.replace(/{{VERIF_URL}}/g, `${BASE_FRONT_URL}/resetPassword/${token}`);
    await sendEmail(to, 'Reset your password', html);
}
