import { Center, LoadingOverlay, Pagination, Table, Title, useMantineTheme } from '@mantine/core';
import dayjs from 'dayjs';
import { forwardRef, Ref } from 'react';

import { pixelTracksRequest } from '../../api/trackmail_request';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { IPaginationDataRef } from '../../types/PaginationData';
import { IPixelTrack } from '../../types/TrackMailType';

interface TrackMailPixelTrackListProps {
    token: string;
    emailId: string;
}

export const TrackMailPixelTrackList = forwardRef(({ token, emailId }: TrackMailPixelTrackListProps, ref: Ref<IPaginationDataRef>) => {
    const theme = useMantineTheme();
    const { data, dataFetch, paginationData, setTargetPage } = usePaginationFetch<IPixelTrack>({
        dataRequest: (targetPage: number) => pixelTracksRequest(targetPage, emailId, token),
        ref,
    });

    const rows = data.map((row: IPixelTrack) => (
        <tr key={row.log_id}>
            <td>{dayjs(row.log_date).format('DD/MM/YYYY [at] HH[h]mm')}</td>
            <td>{row.user_ip}</td>
        </tr>
    ));

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={dataFetch.isLoading} overlayBlur={2} />

            <Title order={4} weight={400} align="center" mb="sm">
                List of email openings
            </Title>

            {data.length > 0 ? (
                <>
                    <Table highlightOnHover sx={{ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white' }}>
                        <thead>
                            <tr>
                                <th>Log date</th>
                                <th>Viewer IP</th>
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
                <Center>No pixel track to display</Center>
            )}
        </div>
    );
});
