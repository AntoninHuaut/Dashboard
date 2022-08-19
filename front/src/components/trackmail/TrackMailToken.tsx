import { ActionIcon, Group, Input, LoadingOverlay, Menu, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useClipboard, useHover } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, TrashX } from 'tabler-icons-react';

import { resetTrackMailTokenRequest } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif, successNotif } from '../../services/notification.services';
import { ITrackMailTokenResponse } from '../../types/TrackMailType';

interface TrackMailTokenProps {
    token: string;
    setToken: (token: string) => void;
    rightElement: React.ReactNode;
}

export function TrackMailToken({ token, setToken, rightElement }: TrackMailTokenProps) {
    const theme = useMantineTheme();
    const clipboard = useClipboard();

    const [showToken, setShowToken] = useState(false);
    const { hovered, ref } = useHover();

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
        resetTokenFetch.makeRequest(resetTrackMailTokenRequest());
    };

    const copyToken = () => {
        clipboard.copy(token);
        successNotif({ title: 'Token copied', message: 'Token copied to clipboard' });
    };

    useEffect(() => setShowToken(hovered && !resetTokenFetch.isLoading), [hovered, resetTokenFetch.isLoading]);

    return (
        <>
            <Text color={theme.primaryColor} weight={600} size="lg">
                TrackMail Token
            </Text>
            <Group position="center">
                <Menu shadow="md">
                    <Menu.Target>
                        <Tooltip label="Reset token">
                            <ActionIcon color="red" variant="light" loading={resetTokenFetch.isLoading}>
                                <TrashX />
                            </ActionIcon>
                        </Tooltip>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item color="red" onClick={resetToken} icon={<TrashX size={20} />}>
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
                            <Tooltip label="Copy token to your clipboard">
                                <ActionIcon color="blue" onClick={copyToken}>
                                    <Copy />
                                </ActionIcon>
                            </Tooltip>
                        }
                    />
                </div>

                {rightElement}
            </Group>
        </>
    );
}
