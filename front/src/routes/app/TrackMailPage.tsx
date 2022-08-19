import { ActionIcon, Center, Container, Group, Loader, Space, Stack, Tooltip } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { Refresh } from 'tabler-icons-react';
import { trackMailTokenRequest } from '../../api/trackmail_request';
import { TrackMailList, TrackMailListRef } from '../../components/trackmail/TrackMailList';

import { TrackMailSettings } from '../../components/trackmail/TrackMailSettings';
import { TrackMailToken } from '../../components/trackmail/TrackMailToken';
import { useFetch } from '../../hooks/useFetch';
import { errorNotif, errorNoDataFetchNotif } from '../../services/notification.services';
import { ITrackMailTokenResponse } from '../../types/TrackMailType';

export function TrackMailPage() {
    const [token, setToken] = useState('');
    const mailListChild = useRef<TrackMailListRef>(null);

    const tokenFetch = useFetch<ITrackMailTokenResponse>({
        onError(err) {
            errorNotif({ title: 'Failed to get TrackMail token', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            setToken(servData.token);
        },
    });

    useEffect(() => {
        tokenFetch.makeRequest(trackMailTokenRequest());
    }, []);

    if (!token) {
        return (
            <Center style={{ height: '75vh' }}>
                <Stack>
                    <Loader size={128} />
                </Stack>
            </Center>
        );
    }

    const trackMailTokenRightElement = (
        <Group spacing="xs">
            <TrackMailSettings token={token} />

            <Tooltip label="Refresh email list">
                <ActionIcon color="blue" onClick={() => mailListChild.current?.refreshTable()}>
                    <Refresh />
                </ActionIcon>
            </Tooltip>
        </Group>
    );

    return (
        <>
            <Stack align="center">
                <TrackMailToken token={token} setToken={setToken} rightElement={trackMailTokenRightElement} />
            </Stack>

            <Space h="xl" />

            <Container>
                <TrackMailList ref={mailListChild} token={token} />
            </Container>
        </>
    );
}
