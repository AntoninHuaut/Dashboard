import { Anchor, Button, Checkbox, Container, Group, Paper, PasswordInput, Text, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconKey } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginRequest } from '../../api/auth_request';
import { EmailInput, isValidEmail } from '../../components/form/EmailInput';
import { useAuth } from '../../hooks/useAuth';
import { useCaptcha } from '../../hooks/useCaptcha';
import { useFetch } from '../../hooks/useFetch';
import { handleInputChange } from '../../services/form.service';
import { errorNoDataFetchNotif, errorNotif } from '../../services/notification.services';
import { CaptchaAction } from '../../types/CaptchaType';
import { ILoginRequest, IUser } from '../../types/LoginType';

export function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const loginFetch = useFetch<IUser>({
        onError(error) {
            errorNotif({
                title: 'An error occurred during login',
                message: error.message,
            });
        },
        onSuccess(data) {
            if (!data) return errorNoDataFetchNotif();

            auth.login(data);
        },
    });

    const [loginRemember, setLoginRemember] = useLocalStorage({ key: 'loginRemember', defaultValue: { checked: false, email: '' } });
    const [login, setLogin] = useState<ILoginRequest>({ email: '', password: '' });
    const [isSignInEnable, setSignInEnable] = useState(false);

    const onSubmit = useCaptcha(CaptchaAction.Login, async (captcha: string) => {
        if (loginRemember.checked) {
            setLoginRemember((v) => ({
                ...v,
                email: login.email,
            }));
        }

        await loginFetch.makeRequest(loginRequest(login, captcha));
        onSubmit(false);
    });

    useEffect(() => setLogin((v) => ({ ...v, email: loginRemember.email })), []);

    useEffect(() => setSignInEnable(isValidEmail(login.email) && login.password.length > 0), [login]);

    useEffect(() => {
        if (!loginRemember.checked) {
            setLoginRemember((v) => ({
                ...v,
                email: '',
            }));
        }
    }, [loginRemember.checked]);

    return (
        <Container size={420} my={40}>
            <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
                Welcome back!
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Do not have an account yet?{' '}
                <Anchor<'a'>
                    href="/register"
                    size="sm"
                    onClick={(evt) => {
                        evt.preventDefault();
                        navigate('/register');
                    }}>
                    Create account
                </Anchor>
            </Text>

            <Paper mt={30} radius="xl" p="lg" shadow="xl">
                <EmailInput value={login.email} disabled={loginFetch.isLoading} onChange={(evt) => handleInputChange<ILoginRequest>(evt, setLogin)} />

                <PasswordInput
                    mt="md"
                    label="Password"
                    name="password"
                    icon={<IconKey />}
                    placeholder="Your password"
                    value={login.password}
                    disabled={loginFetch.isLoading}
                    onChange={(evt) => handleInputChange<ILoginRequest>(evt, setLogin)}
                    required
                />

                <Group position="apart" mt="md">
                    <Checkbox
                        className="umami--click--remember-me"
                        label="Remember me"
                        checked={loginRemember.checked}
                        disabled={loginFetch.isLoading}
                        onChange={() => {
                            setLoginRemember((v) => ({ ...v, checked: !v.checked }));
                        }}
                    />
                    <Anchor<'a'>
                        size="sm"
                        href="/forgotPassword"
                        onClick={(evt) => {
                            evt.preventDefault();
                            navigate('/forgotPassword');
                        }}>
                        Forgot password?
                    </Anchor>
                </Group>
                <Button
                    className="umami--click--sign-in"
                    fullWidth
                    mt="xl"
                    onClick={() => onSubmit(true)}
                    loading={loginFetch.isLoading}
                    disabled={!isSignInEnable}>
                    Sign in
                </Button>

                <Text mt="xs" size="xs" color="dimmed">
                    This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
                    <a href="https://policies.google.com/terms">Terms of Service</a> apply.
                </Text>
            </Paper>
        </Container>
    );
}
