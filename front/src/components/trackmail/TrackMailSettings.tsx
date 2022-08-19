import { ActionIcon, Button, Checkbox, Group, Modal, Space, Stack, Text, useMantineTheme } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Check, Settings, X } from 'tabler-icons-react';

import { HttpStatusCode } from '../../api/HttpStatusCode';
import { trackMailSettings, updateTrackMailSettings } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif, successNotif } from '../../services/notification.services';
import { ITrackMailSettings } from '../../types/TrackMailType';

const defaultSettings = { log_email_from: false, log_email_to: false, log_subject: false };

export function TrackMailSettings() {
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
            errorNotif({ title: 'Failed to update TrackMail settings', message: err.message });
        },
        onSuccess(_servData, statusCode) {
            if (statusCode === HttpStatusCode.NoContent) {
                setOpened(false);
                successNotif({ title: 'Success', message: 'TrackMail settings updated' });
                settingsFetch.makeRequest(trackMailSettings());
            } else {
                errorNotif({ title: 'Failed to update TrackMail settings', message: 'Unknown error' });
            }
        },
    });

    useEffect(() => {
        settingsFetch.makeRequest(trackMailSettings());
    }, []);

    const switchSettings = (key: keyof ITrackMailSettings) => {
        setEditedSettings({ ...editedSettings, [key]: !editedSettings[key] });
    };

    const resetEditedSettings = () => {
        setEditedSettings((v) => ({ ...v, ...originalSettings }));
        setOpened(false);
    };

    const updateSettings = () => updateSettingsFetch.makeRequest(updateTrackMailSettings(editedSettings));

    return (
        <>
            <Modal
                overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
                overlayOpacity={0.55}
                overlayBlur={3}
                opened={opened}
                onClose={() => setOpened(false)}
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
                        <Button leftIcon={<X />} color="red" onClick={resetEditedSettings} loading={settingsFetch.isLoading || updateSettingsFetch.isLoading}>
                            Cancel
                        </Button>
                        <Button leftIcon={<Check />} color="green" onClick={updateSettings} loading={settingsFetch.isLoading || updateSettingsFetch.isLoading}>
                            Update
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <ActionIcon onClick={() => setOpened(true)}>
                <Settings />
            </ActionIcon>
        </>
    );
}
