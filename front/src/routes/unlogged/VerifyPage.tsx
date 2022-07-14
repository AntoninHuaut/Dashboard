import { Button, Container, Paper, TextInput, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Key } from 'tabler-icons-react';

import { verifyRequest } from '../../api/auth_request';
import { useFetch } from '../../api/request';

export function VerifyPage() {
    const params = useParams();
    const navigate = useNavigate();
    const verifyFetch = useFetch();

    const [isAccountVerified, setAccountVerified] = useState(false);
    const [token, setToken] = useState('');
    const [isVerifyEnable, setVerifyEnable] = useState(false);

    useEffect(() => setToken(params.token ?? ''), []);

    useEffect(() => setVerifyEnable(token.length > 0), [token]);

    const onSubmit = () => verifyFetch.makeRequest(verifyRequest(token));

    useLayoutEffect(() => {
        if (verifyFetch.cannotHandleResult()) return;

        if (verifyFetch.error) {
            showNotification({
                title: 'An error occurred during verification',
                message: verifyFetch.error.message,
                color: 'red',
            });
        } else {
            setAccountVerified(true);
            showNotification({
                title: 'Your account has been verified!',
                message: 'You will be redirected to the login page',
                color: 'green',
                autoClose: 3000,
            });

            setTimeout(() => navigate('/login'), 3000);
        }
    }, [verifyFetch.isLoading]);

    return (
        <Container size={420} my={40}>
            <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
                Email verification
            </Title>

            <Paper mt={30} radius="xl" p="lg" shadow="xl">
                <TextInput
                    mt="md"
                    label="Verification token"
                    name="token"
                    icon={<Key />}
                    placeholder="Verification token sent by email"
                    value={token}
                    disabled={verifyFetch.isLoading || isAccountVerified}
                    onChange={(evt) => setToken(evt.target.value)}
                    required
                />

                <Button fullWidth mt="xl" onClick={onSubmit} loading={verifyFetch.isLoading} disabled={!isVerifyEnable || isAccountVerified}>
                    Verify
                </Button>
            </Paper>
        </Container>
    );
}
