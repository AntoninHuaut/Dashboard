import { Anchor, Button, Checkbox, Container, Group, Paper, PasswordInput, Text, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'tabler-icons-react';

import { loginRequest } from '../../api/auth_request';
import { useFetch } from '../../api/request';
import { EmailInput, isValidEmail } from '../../components/form/EmailInput';
import { useAuth } from '../../hooks/useAuth';
import { handleInputChange } from '../../services/form.service';
import { ILoginRequest } from '../../types/LoginType';

export function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const loginFetch = useFetch();

    const [loginRemember, setLoginRemember] = useLocalStorage({ key: 'loginRemember', defaultValue: { checked: false, email: '' } });
    const [login, setLogin] = useState<ILoginRequest>({ email: '', password: '' });
    const [isSignInEnable, setSignInEnable] = useState(false);

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

    const onSubmit = () => {
        if (loginRemember.checked) {
            setLoginRemember((v) => ({
                ...v,
                email: login.email,
            }));
        }

        loginFetch.makeRequest(loginRequest(login));
    };

    useEffect(() => {
        if (loginFetch.cannotHandleResult()) return;

        if (loginFetch.data) {
            auth.login(loginFetch.data);
        }

        if (loginFetch.error) {
            showNotification({
                title: 'An error occurred during login',
                message: loginFetch.error.message,
                color: 'red',
            });
        }
    }, [loginFetch.isLoading]);

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
                    icon={<Key />}
                    placeholder="Your password"
                    value={login.password}
                    disabled={loginFetch.isLoading}
                    onChange={(evt) => handleInputChange<ILoginRequest>(evt, setLogin)}
                    required
                />

                <Group position="apart" mt="md">
                    <Checkbox
                        label="Remember me"
                        checked={loginRemember.checked}
                        disabled={loginFetch.isLoading}
                        onChange={() => {
                            setLoginRemember((v) => ({ ...v, checked: !v.checked }));
                        }}
                    />
                </Group>
                <Button fullWidth mt="xl" onClick={onSubmit} loading={loginFetch.isLoading} disabled={!isSignInEnable}>
                    Sign in
                </Button>
            </Paper>
        </Container>
    );
}
