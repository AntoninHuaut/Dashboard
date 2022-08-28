import { ActionIcon, Button, Group, Text } from '@mantine/core';
import { IconArrowLeft, IconClockHour2 } from '@tabler/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { mailRequest } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif } from '../../services/notification.services';
import { IMail } from '../../types/TrackMailType';

interface TrackMailEntryDetailProps {
    emailId: string;
    token: string;
}

export function TrackMailEntryDetail({ emailId, token }: TrackMailEntryDetailProps) {
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

    return (
        <Group position="apart" mb="xl">
            <ActionIcon size="lg" color="yellow" variant="light" onClick={() => navigate(-1)}>
                <IconArrowLeft size={26} />
            </ActionIcon>

            <Group position="center" spacing="xl">
                <Group spacing={6}>
                    <IconClockHour2 />
                    <Text>{dayjs(mail.created).format('DD/MM/YYYY [at] HH[h]mm')}</Text>
                </Group>
                <Group spacing={6}>
                    <Text color="blue">From:</Text>
                    <Text>{mail.email_from}</Text>
                </Group>
                <Group spacing={6}>
                    <Text color="blue">To:</Text>
                    <Text>{mail.email_to}</Text>
                </Group>
                <Group spacing={6}>
                    <Text color="blue">Subject:</Text>
                    <Text>{mail.subject}</Text>
                </Group>
            </Group>

            <Group></Group>
        </Group>
    );
}