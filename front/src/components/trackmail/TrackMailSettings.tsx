import { ActionIcon, Button, Checkbox, Group, Modal, Space, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { IconCheck, IconSettings, IconX } from '@tabler/icons';
import { useEffect, useState } from 'react';

import { HttpStatusCode } from '../../api/HttpStatusCode';
import { trackMailSettingsRequest, updateTrackMailSettingsRequest } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif, successNotif } from '../../services/notification.services';
import { ITrackMailSettings } from '../../types/TrackMailType';

const defaultSettings = { log_email_from: false, log_email_to: false, log_subject: false };

interface TrackMailSettingsProps {
    token: string;
}

export function TrackMailSettings({ token }: TrackMailSettingsProps) {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    const [originalSettings, setOriginalSettings] = useState<ITrackMailSettings>(defaultSettings);
    const [editedSettings, setEditedSettings] = useState<ITrackMailSettings>(defaultSettings);

    const settingsFetch = useFetch<ITrackMailSettings>({
        onError(err) {
            errorNotif({ title: 'Failed to get TrackMail settings', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            setOriginalSettings(servData);
            setEditedSettings(servData);
        },
    });

    const updateSettingsFetch = useFetch<ITrackMailSettings>({
        onError(err) {
            errorNotif({ title: 'Failed to update settings', message: err.message });
        },
        onSuccess(_servData, statusCode) {
            if (statusCode === HttpStatusCode.NoContent) {
                setOpened(false);
                successNotif({ title: 'Success', message: 'Settings updated' });
                settingsFetch.makeRequest(trackMailSettingsRequest(token));
            } else {
                errorNotif({ title: 'Failed to update settings', message: 'Unknown error' });
            }
        },
    });

    useEffect(() => {
        settingsFetch.makeRequest(trackMailSettingsRequest(token));
    }, []);

    const switchSettings = (key: keyof ITrackMailSettings) => {
        setEditedSettings({ ...editedSettings, [key]: !editedSettings[key] });
    };

    const resetEditedSettings = () => {
        setEditedSettings((v) => ({ ...v, ...originalSettings }));
        setOpened(false);
    };

    const updateSettings = () => updateSettingsFetch.makeRequest(updateTrackMailSettingsRequest(editedSettings, token));

    return (
        <>
            <Modal
                overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
                overlayOpacity={0.55}
                overlayBlur={3}
                opened={opened}
                onClose={() => {
                    setOpened(false);
                    resetEditedSettings();
                }}
                title="TrackMail Settings">
                <Stack>
                    <Text size="sm">Configure what TrackMail records about tracked emails.</Text>
                    <Space />
                    <Checkbox
                        checked={editedSettings.log_email_from}
                        onChange={() => switchSettings('log_email_from')}
                        label="The sender of the email"
                        radius="md"
                        disabled={settingsFetch.isLoading || updateSettingsFetch.isLoading}
                    />
                    <Checkbox
                        checked={editedSettings.log_email_to}
                        onChange={() => switchSettings('log_email_to')}
                        label="The recipient(s) of the email"
                        radius="md"
                        disabled={settingsFetch.isLoading || updateSettingsFetch.isLoading}
                    />
                    <Checkbox
                        checked={editedSettings.log_subject}
                        onChange={() => switchSettings('log_subject')}
                        label="The subject of the email"
                        radius="md"
                        disabled={settingsFetch.isLoading || updateSettingsFetch.isLoading}
                    />
                    <Space />
                </Stack>

                <Stack mt="xl" align="center">
                    <Group>
                        <Button
                            leftIcon={<IconX />}
                            color="red"
                            onClick={resetEditedSettings}
                            loading={settingsFetch.isLoading || updateSettingsFetch.isLoading}>
                            Cancel
                        </Button>
                        <Button
                            leftIcon={<IconCheck />}
                            color="green"
                            onClick={updateSettings}
                            loading={settingsFetch.isLoading || updateSettingsFetch.isLoading}
                            disabled={Object.keys(originalSettings).every(
                                (key) => originalSettings[key as keyof ITrackMailSettings] == editedSettings[key as keyof ITrackMailSettings]
                            )}>
                            Update
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Tooltip label="TrackMail Settings">
                <ActionIcon onClick={() => setOpened(true)}>
                    <IconSettings />
                </ActionIcon>
            </Tooltip>
        </>
    );
}
