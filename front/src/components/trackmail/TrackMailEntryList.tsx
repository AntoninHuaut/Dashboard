import { ActionIcon, Button, Center, Group, LoadingOverlay, Menu, Pagination, Stack, Table, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconInfoCircle, IconTrashX, IconX } from '@tabler/icons';
import dayjs from 'dayjs';
import { forwardRef, Ref } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteMailRequest, mailsRequest } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { useMailFormatter } from '../../hooks/useMailFormatter';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { errorNotif, successNotif } from '../../services/notification.services';
import { IPaginationDataRef } from '../../types/PaginationData';
import { IMail } from '../../types/TrackMailType';

interface TrackMailEntryListProps {
    token: string;
}

export const TrackMailEntryList = forwardRef(({ token }: TrackMailEntryListProps, ref: Ref<IPaginationDataRef>) => {
    const displayEmailData = useMediaQuery('(min-width: 1200px)');
    const mailFormatter = useMailFormatter(false);

    const theme = useMantineTheme();
    const { data, dataFetch, paginationData, setTargetPage, refreshData } = usePaginationFetch<IMail>({
        dataRequest: (targetPage: number) => mailsRequest(targetPage, token),
        ref,
    });
    const navigate = useNavigate();
    const deleteMailFetch = useFetch({
        onError(err) {
            errorNotif({ title: 'Failed to delete mail', message: err.message });
        },
        onSuccess(_data) {
            successNotif({ title: 'Success', message: 'Mail has been deleted' });
            refreshData();
        },
    });
    const deleteMailAction = (mail: IMail) => {
        deleteMailFetch.makeRequest(deleteMailRequest(mail.email_id, token));
    };

    const rows = data.map((row: IMail) => {
        const { subject, emailFrom, emailTo } = mailFormatter.formatEmail(row);
        return (
            <tr key={row.email_id}>
                <td>{dayjs(row.created).format('DD/MM/YYYY [at] HH[h]mm')}</td>
                {displayEmailData && (
                    <>
                        <td>{subject}</td>
                        <td>{emailFrom}</td>
                        <td>{emailTo}</td>
                    </>
                )}
                <td>
                    <Group>
                        {row.logsTrackCount > 0 ? (
                            <ActionIcon color="green" onClick={() => navigate(`/app/track-mail/${row.email_id}/logsTrack`)}>
                                <IconInfoCircle />
                            </ActionIcon>
                        ) : (
                            <IconX width={28} color="red" />
                        )}
                        <Menu shadow="md" width={205}>
                            <Menu.Target>
                                <Tooltip label="Delete">
                                    <ActionIcon color="red">
                                        <IconTrashX />
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item>
                                    <Text size="md" align="center" mb="xs">
                                        Can't be revert!
                                    </Text>
                                    <Group spacing="xs" position="center">
                                        <Button color="blue">Cancel</Button>
                                        <Button color="red" onClick={() => deleteMailAction(row)}>
                                            Delete
                                        </Button>
                                    </Group>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </td>
            </tr>
        );
    });

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={dataFetch.isLoading || deleteMailFetch.isLoading} overlayBlur={2} />

            <Stack>
                {data.length > 0 ? (
                    <>
                        <Table highlightOnHover sx={{ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white' }}>
                            <thead>
                                <tr>
                                    <th>Creation date</th>
                                    {displayEmailData && (
                                        <>
                                            <th>Subject</th>
                                            <th>Sender email</th>
                                            <th>Recipients email</th>
                                        </>
                                    )}
                                    <th>Opened</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>

                        <Center>
                            <Pagination
                                page={paginationData.page + 1}
                                onChange={(newPage) => setTargetPage(newPage - 1)}
                                total={Math.ceil(paginationData.total / paginationData.numberPerPage)}
                            />
                        </Center>
                    </>
                ) : (
                    <Center>No mail to display</Center>
                )}
            </Stack>
        </div>
    );
});
