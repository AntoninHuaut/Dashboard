import { ActionIcon, Button, Group, Input, LoadingOverlay, Menu, Popover, Stack, Text, useMantineTheme } from '@mantine/core';
import { useClipboard, useDisclosure, useHover } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, Refresh, Settings } from 'tabler-icons-react';

import { resetTrackMailToken, trackMailToken } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif, successNotif } from '../../services/notification.services';
import { ITrackMailTokenResponse } from '../../types/TrackMailType';

export function TrackMailPage() {
    const theme = useMantineTheme();
    const clipboard = useClipboard();

    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const { hovered, ref } = useHover();

    const tokenFetch = useFetch<ITrackMailTokenResponse>({
        onError(err) {
            errorNotif({ title: 'Failed to get TrackMail token', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            setToken(servData.token);
        },
    });

    const resetTokenFetch = useFetch<ITrackMailTokenResponse>({
        onError(err) {
            errorNotif({ title: 'Failed to reset TrackMail token', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            successNotif({ title: 'Successfully reset TrackMail token', message: 'New token has been generated' });
            setToken(servData.token);
        },
    });

    const resetToken = () => {
        resetTokenFetch.makeRequest(resetTrackMailToken());
        close();
    };

    const copyToken = () => {
        clipboard.copy(token);
        successNotif({ title: 'Token copied', message: 'Token copied to clipboard' });
    };

    useEffect(() => setShowToken(hovered && !resetTokenFetch.isLoading), [hovered, resetTokenFetch.isLoading]);

    useEffect(() => {
        tokenFetch.makeRequest(trackMailToken());
    }, []);

    return (
        <>
            <Stack align="center">
                <Text color={theme.primaryColor} weight={600} size="lg">
                    TrackMail Token
                </Text>
                <Group position="center">
                    <Menu shadow="md">
                        <Menu.Target>
                            <ActionIcon color="red" variant="light" loading={resetTokenFetch.isLoading}>
                                <Refresh />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item color="red" onClick={resetToken} icon={<Refresh size={14} />}>
                                Reset token (can't be revert)
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>

                    <div ref={ref} style={{ width: 300, position: 'relative' }}>
                        <LoadingOverlay visible={resetTokenFetch.isLoading} overlayBlur={2} />

                        <Input
                            value={showToken ? token : token.replace(/./g, '*')}
                            readOnly
                            variant="filled"
                            icon={showToken ? <Eye /> : <EyeOff />}
                            rightSection={
                                <ActionIcon color="blue" onClick={copyToken}>
                                    <Copy />
                                </ActionIcon>
                            }
                        />
                    </div>

                    <ActionIcon onClick={() => errorNotif({ title: 'todo', message: 'todo' })}>
                        <Settings />
                    </ActionIcon>
                </Group>
            </Stack>
        </>
    );
}
