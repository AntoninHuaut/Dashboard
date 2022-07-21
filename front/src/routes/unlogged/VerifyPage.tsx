import { Anchor, Button, Container, Paper, Text, TextInput, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Key } from 'tabler-icons-react';

import { verifyRequest } from '../../api/auth_request';
import { useFetch } from '../../api/request';
import { useCaptcha } from '../../hooks/useCaptcha';
import { handleInputChange } from '../../services/form.service';
import { safeTrack } from '../../services/umami.service';
import { CaptchaAction } from '../../types/CaptchaType';
import { IVerifyRequest } from '../../types/LoginType';

export function VerifyPage() {
    const params = useParams();
    const navigate = useNavigate();
    const verifyFetch = useFetch();

    const [isAccountVerified, setAccountVerified] = useState(false);
    const [isVerifyEnable, setVerifyEnable] = useState(false);

    const [verify, setVerify] = useState<IVerifyRequest>({ token: '' });

    const onSubmit = useCaptcha(CaptchaAction.Verify, async (captcha: string) => {
        await verifyFetch.makeRequest(verifyRequest(verify, captcha));
        onSubmit(false);
    });

    useEffect(() => setVerify((prev) => ({ ...prev, token: params.token ?? '' })), []);

    useEffect(() => setVerifyEnable(verify.token.length > 0), [verify.token]);

    useLayoutEffect(() => {
        if (verifyFetch.cannotHandleResult()) return;

        if (verifyFetch.error) {
            showNotification({
                title: 'An error occurred during verification',
                message: verifyFetch.error.message,
                color: 'red',
            });
        } else {
            safeTrack('verify', 'account');
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
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Your account is already activated?{' '}
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
                    value={verify.token}
                    disabled
                    onChange={(evt) => handleInputChange(evt, setVerify)}
                    required
                />

                <Button fullWidth mt="xl" onClick={() => onSubmit(true)} loading={verifyFetch.isLoading} disabled={!isVerifyEnable || isAccountVerified}>
                    Verify
                </Button>
            </Paper>
        </Container>
    );
}
