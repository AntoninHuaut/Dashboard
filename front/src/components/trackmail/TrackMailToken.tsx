import { ActionIcon, Group, Input, LoadingOverlay, Menu, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useClipboard, useHover } from '@mantine/hooks';
import { IconCopy, IconEye, IconEyeOff, IconTrashX } from '@tabler/icons';
import { useEffect, useState } from 'react';

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
            <Text weight={600} size="xl">
                Token
            </Text>
            <Group position="center">
                <Menu shadow="md">
                    <Menu.Target>
                        <Tooltip label="Reset token">
                            <ActionIcon color="red" variant="light" loading={resetTokenFetch.isLoading}>
                                <IconTrashX />
                            </ActionIcon>
                        </Tooltip>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item color="red" onClick={resetToken} icon={<IconTrashX size={20} />}>
                            Reset token (can't be revert)
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                <Stack
                    ref={ref}
                    style={{
                        position: 'relative',
                    }}
                    sx={{
                        [theme.fn.largerThan('md')]: {
                            width: 300,
                        },
                        [theme.fn.smallerThan('md')]: {
                            width: 250,
                        },
                        [theme.fn.smallerThan('xs')]: {
                            width: 150,
                        },
                    }}>
                    <LoadingOverlay visible={resetTokenFetch.isLoading} overlayBlur={2} />

                    <Input
                        value={showToken ? token : token.replace(/./g, '*')}
                        readOnly
                        variant="filled"
                        icon={showToken ? <IconEye /> : <IconEyeOff />}
                        rightSection={
                            <Tooltip label="Copy token to your clipboard">
                                <ActionIcon color="blue" onClick={copyToken}>
                                    <IconCopy />
                                </ActionIcon>
                            </Tooltip>
                        }
                    />
                </Stack>

                {rightElement}
            </Group>
        </>
    );
}
