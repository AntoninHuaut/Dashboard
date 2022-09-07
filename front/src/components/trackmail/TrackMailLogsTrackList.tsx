import { Badge, Center, LoadingOverlay, Pagination, Table, Title, useMantineTheme } from '@mantine/core';
import dayjs from 'dayjs';
import { forwardRef, Ref } from 'react';

import { logsTrackRequest } from '../../api/trackmail_request';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { IPaginationDataRef } from '../../types/PaginationData';
import { ILinkTrack, IPixelTrack } from '../../types/TrackMailType';

interface TrackMailLogsTrackListProps {
    token: string;
    emailId: string;
}

export const TrackMailLogsTrackList = forwardRef(({ token, emailId }: TrackMailLogsTrackListProps, ref: Ref<IPaginationDataRef>) => {
    const theme = useMantineTheme();
    const { data, dataFetch, paginationData, setTargetPage } = usePaginationFetch<IPixelTrack | ILinkTrack>({
        dataRequest: (targetPage: number) => logsTrackRequest(targetPage, emailId, token),
        ref,
    });

    const rows = data.map((row: IPixelTrack | ILinkTrack) => {
        const hasLink = 'link_url' in row && row.link_url;

        return (
            <tr key={row.log_id}>
                <td>{hasLink ? <Badge color={'blue'}>Click on link</Badge> : <Badge color={'orange'}>Mail opening</Badge>}</td>
                <td>{dayjs(row.log_date).format('DD/MM/YYYY [at] HH[h]mm')}</td>
                <td>{row.user_ip}</td>
                {hasLink ? (
                    <td>
                        <a target={'_blank'} href={row.link_url}>
                            {row.link_url}
                        </a>
                    </td>
                ) : (
                    <td>-</td>
                )}
            </tr>
        );
    });

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={dataFetch.isLoading} overlayBlur={2} />

            <Title order={4} weight={400} align="center" mb="sm">
                List of logs
            </Title>

            {data.length > 0 ? (
                <>
                    <Table highlightOnHover sx={{ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white' }}>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Log date</th>
                                <th>Viewer IP</th>
                                <th>Link</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </Table>

                    <Center mt="md">
                        <Pagination
                            page={paginationData.page + 1}
                            onChange={(newPage) => setTargetPage(newPage - 1)}
                            total={Math.ceil(paginationData.total / paginationData.numberPerPage)}
                        />
                    </Center>
                </>
            ) : (
                <Center>No logs track to display</Center>
            )}
        </div>
    );
});
