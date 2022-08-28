import { Button, Center, LoadingOverlay, Pagination, Stack, Table } from '@mantine/core';
import dayjs from 'dayjs';
import { forwardRef, Ref } from 'react';

import { pixelTracksRequest } from '../../api/trackmail_request';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { IPaginationDataRef } from '../../types/PaginationData';
import { IPixelTrack } from '../../types/TrackMailType';
import { useNavigate } from 'react-router-dom';
import { TrackMailEntryDetail } from './TrackMailEntryDetail';

interface TrackMailPixelTrackListProps {
    token: string;
    emailId: string;
}

export const TrackMailPixelTrackList = forwardRef(({ token, emailId }: TrackMailPixelTrackListProps, ref: Ref<IPaginationDataRef>) => {
    const navigate = useNavigate();
    const { data, dataFetch, paginationData, setTargetPage } = usePaginationFetch<IPixelTrack>({
        token,
        dataRequest: (targetPage: number, token: string) => pixelTracksRequest(targetPage, emailId, token),
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

            <Stack>
                <Button onClick={() => navigate(-1)}>Back</Button>

                {data.length > 0 ? (
                    <>
                        <Table highlightOnHover sx={{ backgroundColor: 'white' }}>
                            <thead>
                                <tr>
                                    <th>Log date</th>
                                    <th>Viewer IP</th>
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
                    <Center>No pixel track to display</Center>
                )}
            </Stack>
        </div>
    );
});
