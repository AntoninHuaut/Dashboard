import { Anchor, Button, Container, Paper, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Key } from 'tabler-icons-react';

import { verifyRequest } from '../../api/auth_request';
import { useCaptcha } from '../../hooks/useCaptcha';
import { useFetch } from '../../hooks/useFetch';
import { handleInputChange } from '../../services/form.service';
import { errorNotif, successNotif } from '../../services/notification.services';
import { safeTrack } from '../../services/umami.service';
import { CaptchaAction } from '../../types/CaptchaType';
import { IVerifyRequest } from '../../types/LoginType';

export function VerifyPage() {
    const params = useParams();
    const navigate = useNavigate();
    const verifyFetch = useFetch({
        onError(error) {
            errorNotif({ title: 'An error occurred during verification', message: error.message });
        },
        onNoData() {
            safeTrack('verify', 'account');
            setAccountVerified(true);
            const autoCloseDelay = successNotif({
                title: 'Your account has been verified!',
                message: 'You will be redirected to the login page',
            });

            setTimeout(() => navigate('/login'), autoCloseDelay);
        },
    });

    const [isAccountVerified, setAccountVerified] = useState(false);
    const [isVerifyEnable, setVerifyEnable] = useState(false);

    const [verify, setVerify] = useState<IVerifyRequest>({ token: '' });

    const onSubmit = useCaptcha(CaptchaAction.Verify, async (captcha: string) => {
        await verifyFetch.makeRequest(verifyRequest(verify, captcha));
        onSubmit(false);
    });

    useEffect(() => setVerify((prev) => ({ ...prev, token: params.token ?? '' })), []);

    useEffect(() => setVerifyEnable(verify.token.length > 0), [verify.token]);

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
