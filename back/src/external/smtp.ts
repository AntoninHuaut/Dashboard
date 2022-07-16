import { SMTPClient } from 'denomailer';
import * as path from 'path';

import { config } from '/config.ts';

const TEMPLATE_FOLDER = path.dirname(path.fromFileUrl(import.meta.url)) + '/smtp_template';
const TEMPLATES = {
    verifUser: Deno.readTextFileSync(`${TEMPLATE_FOLDER}/verifUser.html`),
    resetPassword: Deno.readTextFileSync(`${TEMPLATE_FOLDER}/resetPassword.html`),
};

async function sendEmail(to: string, subject: string, html: string) {
    const client = new SMTPClient({
        connection: {
            hostname: config.SMTP_SERVER,
            port: config.SMTP_PORT,
            auth: {
                username: config.SMTP_LOGIN,
                password: config.SMTP_PASSWORD,
            },
        },
    });

    await client.send({
        from: config.SMTP_FROM,
        to: to,
        subject: subject,
        content: 'auto',
        html: html,
    });

    await client.close();
}

export async function sendRegistrationEmail(to: string, token: string) {
    const html = `${TEMPLATES.verifUser}`.replace(/{{VERIF_URL}}/g, `${config.BASE_FRONT_URL}/verify/${token}`);
    await sendEmail(to, 'Verify your email', html);
}

export async function sendResetPasswordEmail(to: string, token: string) {
    const html = `${TEMPLATES.resetPassword}`.replace(/{{VERIF_URL}}/g, `${config.BASE_FRONT_URL}/resetPassword/${token}`);
    await sendEmail(to, 'Reset your password', html);
}
