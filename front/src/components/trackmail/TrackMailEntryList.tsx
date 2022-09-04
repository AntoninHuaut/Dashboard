import { ActionIcon, Center, Group, LoadingOverlay, Pagination, Stack, Table, useMantineTheme } from '@mantine/core';
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons';
import dayjs from 'dayjs';
import { forwardRef, Ref } from 'react';
import { useNavigate } from 'react-router-dom';

import { mailsRequest } from '../../api/trackmail_request';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { IPaginationDataRef } from '../../types/PaginationData';
import { IMail } from '../../types/TrackMailType';

interface TrackMailEntryListProps {
    token: string;
}

export const TrackMailEntryList = forwardRef(({ token }: TrackMailEntryListProps, ref: Ref<IPaginationDataRef>) => {
    const theme = useMantineTheme();
    const { data, dataFetch, paginationData, setTargetPage } = usePaginationFetch<IMail>({
        dataRequest: (targetPage: number) => mailsRequest(targetPage, token),
        ref,
    });
    const navigate = useNavigate();

    const rows = data.map((row: IMail) => (
        <tr key={row.email_id}>
            <td>{dayjs(row.created).format('DD/MM/YYYY [at] HH[h]mm')}</td>
            <td>{row.subject}</td>
            <td>{row.email_from}</td>
            <td>{row.email_to}</td>
            <td>
                {row.pixelTrackCount > 0 ? (
                    <Group>
                        <IconCheck color="green" />
                        <ActionIcon color="blue" onClick={() => navigate(`/app/track-mail/${row.email_id}/pixelTrack`)}>
                            <IconInfoCircle />
                        </ActionIcon>
                    </Group>
                ) : (
                    <IconX color="red" />
                )}
            </td>
        </tr>
    ));

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={dataFetch.isLoading} overlayBlur={2} />

            <Stack>
                {data.length > 0 ? (
                    <>
                        <Table highlightOnHover sx={{ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white' }}>
                            <thead>
                                <tr>
                                    <th>Creation date</th>
                                    <th>Subject</th>
                                    <th>Sender email</th>
                                    <th>Recipients email</th>
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
