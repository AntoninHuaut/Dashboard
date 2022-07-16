import { Anchor, Button, Container, Paper, Text, TextInput, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Key } from 'tabler-icons-react';

import { useFetch } from '../../api/request';
import { resetPasswordRequest } from '../../api/user_request';
import { ConfirmPassword } from '../../components/form/ConfirmPassword';
import { isValidPassword, PasswordStrength } from '../../components/form/PasswordStength';
import { useCaptcha } from '../../hooks/useCaptcha';
import { handleInputChange } from '../../services/form.service';
import { CaptchaAction } from '../../types/CaptchaType';
import { IResetPasswordRequest } from '../../types/LoginType';

export function ResetPasswordPage() {
    const params = useParams();
    const navigate = useNavigate();
    const resetPasswordFetch = useFetch();

    const [resetPwd, setResetPwd] = useState<IResetPasswordRequest>({
        token: params.token ?? '',
        newPassword: '',
        confirmPassword: '',
    });

    const onSubmit = useCaptcha(CaptchaAction.ResetPassword, async (captcha: string) => {
        resetPasswordFetch.makeRequest(resetPasswordRequest(resetPwd, captcha));
        onSubmit(false);
    });

    const [isPasswordReset, setPasswordReset] = useState(false);
    const [isButtonEnable, setButtonEnable] = useState(false);

    useEffect(
        () => setButtonEnable(resetPwd.token.length > 1 && isValidPassword(resetPwd.newPassword) && resetPwd.newPassword === resetPwd.confirmPassword),
        [resetPwd]
    );

    useLayoutEffect(() => {
        if (resetPasswordFetch.cannotHandleResult()) return;

        if (resetPasswordFetch.error) {
            showNotification({
                title: 'An error occurred during password reset',
                message: resetPasswordFetch.error.message,
                color: 'red',
            });
        } else {
            setPasswordReset(true);
            showNotification({
                title: 'Your password has been reset!',
                message: 'You will be redirected to the login page',
                color: 'green',
                autoClose: 3000,
            });

            setTimeout(() => navigate('/login'), 3000);
        }
    }, [resetPasswordFetch.isLoading]);

    return (
        <Container size={420} my={40}>
            <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
                Reset Password
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Remember your password?{' '}
                <Anchor<'a'>
                    href="/login"
                    size="sm"
                    onClick={(evt) => {
                        evt.preventDefault();
                        navigate('/login');
                    }}>
                    Sign in
                </Anchor>
            </Text>

            <Paper mt={30} radius="xl" p="lg" shadow="xl">
                <TextInput
                    mt="md"
                    label="Verification token"
                    name="token"
                    icon={<Key />}
                    placeholder="Verification token sent by email"
                    value={resetPwd.token}
                    disabled
                    onChange={(evt) => handleInputChange<IResetPasswordRequest>(evt, setResetPwd)}
                    required
                />

                <PasswordStrength
                    mt="md"
                    label="Password"
                    name="newPassword"
                    icon={<Key />}
                    placeholder="Your password"
                    value={resetPwd.newPassword}
                    disabled={resetPasswordFetch.isLoading || isPasswordReset}
                    onChange={(evt) => handleInputChange<IResetPasswordRequest>(evt, setResetPwd)}
                />

                <ConfirmPassword
                    mt="md"
                    password={resetPwd.newPassword}
                    confirmPassword={resetPwd.confirmPassword}
                    onChange={(evt) => handleInputChange<IResetPasswordRequest>(evt, setResetPwd)}
                    disabled={resetPasswordFetch.isLoading || isPasswordReset}
                />

                <Button fullWidth mt="xl" onClick={() => onSubmit(true)} loading={resetPasswordFetch.isLoading} disabled={!isButtonEnable || isPasswordReset}>
                    Reset password
                </Button>
            </Paper>
        </Container>
    );
}
