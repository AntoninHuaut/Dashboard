import { Anchor, Button, Container, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Key, User } from 'tabler-icons-react';

import { useFetch } from '../api/request';
import { registerRequest } from '../api/user_request';
import { EmailInput, isValidEmail } from '../components/form/EmailInput';
import { isValidPassword, PasswordStrength } from '../components/form/PasswordStength';
import { handleInputChange } from '../services/form.service';
import { IRegisterRequest } from '../types/LoginType';

export function RegisterPage() {
    const navigate = useNavigate();
    const registerFetch = useFetch();

    const [register, setRegister] = useState<IRegisterRequest>({ email: '', username: '', password: '', confirmPassword: '' });
    const [isRegisterEnable, setRegisterEnable] = useState(false);
    const [isAccountCreated, setAccountCreated] = useState(false);

    const onSubmit = () => registerFetch.makeRequest(registerRequest(register));

    useEffect(
        () =>
            setRegisterEnable(
                isValidEmail(register.email) &&
                    register.username.trim().length > 0 &&
                    isValidPassword(register.password) &&
                    register.password === register.confirmPassword
            ),
        [register]
    );

    useLayoutEffect(() => {
        if (registerFetch.cannotHandleResult()) return;

        if (registerFetch.data) {
            setAccountCreated(true);
            showNotification({
                title: 'Your account has been created!',
                message: 'You will be redirected to the login page',
                color: 'green',
                autoClose: 3000,
            });

            setTimeout(() => navigate('/login'), 3000);
        }

        if (registerFetch.error) {
            showNotification({
                title: 'An error occurred during register',
                message: registerFetch.error.message,
                color: 'red',
            });
        }
    }, [registerFetch.isLoading]);

    return (
        <Container size={420} my={40}>
            <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
                Welcome!
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Already have an account?{' '}
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
                <EmailInput
                    value={register.email}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                />

                <TextInput
                    mt="md"
                    label="Username"
                    name="username"
                    icon={<User />}
                    placeholder="Your username"
                    value={register.username}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                />

                <PasswordStrength
                    mt="md"
                    label="Password"
                    name="password"
                    icon={<Key />}
                    placeholder="Your password"
                    value={register.password}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                />

                <PasswordInput
                    mt="md"
                    label="Confirm password"
                    name="confirmPassword"
                    icon={<CircleCheck />}
                    placeholder="Confirm your password"
                    value={register.confirmPassword}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    required
                />

                <Button fullWidth mt="xl" onClick={onSubmit} loading={registerFetch.isLoading} disabled={!isRegisterEnable || isAccountCreated}>
                    Register
                </Button>
            </Paper>
        </Container>
    );
}
