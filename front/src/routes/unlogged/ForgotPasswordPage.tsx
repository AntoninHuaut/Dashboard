import { Anchor, Button, Container, Paper, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFetch } from '../../hooks/useFetch';
import { forgotPasswordRequest } from '../../api/user_request';
import { EmailInput, isValidEmail } from '../../components/form/EmailInput';
import { useCaptcha } from '../../hooks/useCaptcha';
import { CaptchaAction } from '../../types/CaptchaType';
import { IFogotPasswordRequest } from '../../types/LoginType';
import { handleInputChange } from '../../services/form.service';
import { safeTrack } from '../../services/umami.service';
import { errorNotif, successNotif } from '../../services/notification.services';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const forgotPasswordFetch = useFetch({
        onError(error) {
            errorNotif({
                title: 'An error occurred during password reset',
                message: error.message,
            });
        },
        onSuccess(_data) {
            safeTrack('forgot-password', 'account');
            setRequestSent(true);
            const autoCloseDelay = successNotif({
                title: 'Your password reset link has been sent',
                message: 'You will be redirected to the login page',
            });

            setTimeout(() => navigate('/login'), autoCloseDelay);
        },
    });

    const [isRequestSent, setRequestSent] = useState(false);
    const [isButtonEnable, setButtonEnable] = useState(false);

    const [forgotPassword, setForgotPassword] = useState<IFogotPasswordRequest>({ email: '' });

    const onSubmit = useCaptcha(CaptchaAction.ForgotPassword, async (captcha: string) => {
        await forgotPasswordFetch.makeRequest(forgotPasswordRequest(forgotPassword, captcha));
        onSubmit(false);
    });

    useEffect(() => setButtonEnable(isValidEmail(forgotPassword.email)), [forgotPassword.email]);

    return (
        <Container size={420} my={40}>
            <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
                Forgot Password
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Remember your password?{' '}
                <Anchor<'a'>
                    href="/login"
                    size="sm"
                    onClick={(evt) => {
                        evt.preventDefault();
                        safeTrack('sign-in', 'link');
                        navigate('/login');
                    }}>
                    Sign in
                </Anchor>
            </Text>

            <Paper mt={30} radius="xl" p="lg" shadow="xl">
                <EmailInput
                    value={forgotPassword.email}
                    disabled={forgotPasswordFetch.isLoading}
                    onChange={(evt) => handleInputChange(evt, setForgotPassword)}
                />

                <Button
                    className="umami--click--forgot-password"
                    fullWidth
                    mt="xl"
                    onClick={() => onSubmit(true)}
                    loading={forgotPasswordFetch.isLoading}
                    disabled={!isButtonEnable || isRequestSent}>
                    Send reset link
                </Button>
            </Paper>
        </Container>
    );
}
