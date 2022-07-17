import { Anchor, Button, Container, Paper, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFetch } from '../../api/request';
import { forgotPasswordRequest } from '../../api/user_request';
import { EmailInput, isValidEmail } from '../../components/form/EmailInput';
import { useCaptcha } from '../../hooks/useCaptcha';
import { CaptchaAction } from '../../types/CaptchaType';
import { IFogotPasswordRequest } from '../../types/LoginType';
import { handleInputChange } from '../../services/form.service';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const forgotPasswordFetch = useFetch();

    const [isRequestSent, setRequestSent] = useState(false);
    const [isButtonEnable, setButtonEnable] = useState(false);

    const [forgotPassword, setForgotPassword] = useState<IFogotPasswordRequest>({ email: '' });

    const onSubmit = useCaptcha(CaptchaAction.ForgotPassword, async (captcha: string) => {
        await forgotPasswordFetch.makeRequest(forgotPasswordRequest(forgotPassword, captcha));
        onSubmit(false);
    });

    useEffect(() => setButtonEnable(isValidEmail(forgotPassword.email)), [forgotPassword.email]);

    useLayoutEffect(() => {
        if (forgotPasswordFetch.cannotHandleResult()) return;

        if (forgotPasswordFetch.error) {
            showNotification({
                title: 'An error occurred during password reset',
                message: forgotPasswordFetch.error.message,
                color: 'red',
            });
        } else {
            umami.trackEvent('forgot-password', 'account');
            setRequestSent(true);
            showNotification({
                title: 'Your password reset link has been sent',
                message: 'You will be redirected to the login page',
                color: 'green',
                autoClose: 3000,
            });

            setTimeout(() => navigate('/login'), 3000);
        }
    }, [forgotPasswordFetch.isLoading]);

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
                        umami.trackEvent('sign-in', 'link');
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
