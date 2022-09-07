import { ActionIcon, Center, Container, Group, Loader, Space, Stack, Title, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { trackMailTokenRequest } from '../../api/trackmail_request';
import { TrackMailEntryDetail } from '../../components/trackmail/TrackMailEntryDetail';
import { TrackMailEntryList } from '../../components/trackmail/TrackMailEntryList';
import { TrackMailLogsTrackList } from '../../components/trackmail/TrackMailLogsTrackList';
import { TrackMailSettings } from '../../components/trackmail/TrackMailSettings';
import { TrackMailToken } from '../../components/trackmail/TrackMailToken';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif } from '../../services/notification.services';
import { IPaginationDataRef } from '../../types/PaginationData';
import { ITrackMailTokenResponse } from '../../types/TrackMailType';

export function TrackMailPage() {
    const { emailIdParam } = useParams();
    const location = useLocation();
    const subTypeLocation = location.pathname.split('/').pop();
    const [emailId, setEmailId] = useState<string | undefined>();

    const [token, setToken] = useState('');
    const paginationChildRef = useRef<IPaginationDataRef>(null);

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

    useEffect(() => {
        setEmailId(emailIdParam);
    }, [emailIdParam]);

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
                <ActionIcon color="blue" onClick={() => paginationChildRef.current?.refreshData()}>
                    <IconRefresh />
                </ActionIcon>
            </Tooltip>
        </Group>
    );

    return (
        <>
            <Title order={1} align="center">
                TrackMail
            </Title>

            <Space h="xl" />

            <Stack align="center">
                <TrackMailToken token={token} setToken={setToken} rightElement={trackMailTokenRightElement} />
            </Stack>

            <Space h="xl" />

            <Container fluid>
                {subTypeLocation === 'track-mail' ? (
                    <TrackMailEntryList ref={paginationChildRef} token={token} />
                ) : (
                    emailId && (
                        <>
                            <TrackMailEntryDetail emailId={emailId} token={token} />
                            <TrackMailLogsTrackList emailId={emailId} ref={paginationChildRef} token={token} />
                        </>
                    )
                )}
            </Container>
        </>
    );
}
