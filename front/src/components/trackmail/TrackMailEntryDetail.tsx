import { Button, Center, Group, Text, useMantineTheme } from '@mantine/core';
import { IconArrowLeft, IconClockHour2 } from '@tabler/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { mailRequest } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { useMailFormatter } from '../../hooks/useMailFormatter';
import { errorNoDataFetchNotif, errorNotif } from '../../services/notification.services';
import { IMail } from '../../types/TrackMailType';

interface TrackMailEntryDetailProps {
    emailId: string;
    token: string;
}

export function TrackMailEntryDetail({ emailId, token }: TrackMailEntryDetailProps) {
    const theme = useMantineTheme();

    const mailFormatter = useMailFormatter(true);
    const navigate = useNavigate();
    const [mail, setMail] = useState<IMail | undefined>();
    const mailFetch = useFetch<IMail>({
        onError(err) {
            errorNotif({ title: 'Failed to get data', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            setMail(servData);
        },
    });

    useEffect(() => {
        mailFetch.makeRequest(mailRequest(emailId, token));
    }, []);

    if (!mail) return <></>;

    const { subject, emailFrom, emailTo } = mailFormatter.formatEmail(mail);

    return (
        <>
            <Center>
                <Button compact mb="xl" leftIcon={<IconArrowLeft />} color={theme.primaryColor} variant="light" onClick={() => navigate(-1)}>
                    Back to the email list
                </Button>
            </Center>

            <Group position="center" spacing="xs" mb="xl">
                <Group spacing={6}>
                    <IconClockHour2 />
                    <Text>{dayjs(mail.created).format('DD/MM/YYYY [at] HH[h]mm')}</Text>
                </Group>
                <Group spacing={6}>
                    <Text color="blue">Subject:</Text>
                    <Text>{subject}</Text>
                </Group>
                <Group spacing={6}>
                    <Text color="blue">From:</Text>
                    <Text>{emailFrom}</Text>
                </Group>
                <Group spacing={6}>
                    <Text color="blue">To:</Text>
                    <Text>{emailTo}</Text>
                </Group>
            </Group>
        </>
    );
}
