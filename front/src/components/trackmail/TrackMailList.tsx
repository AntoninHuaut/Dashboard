import { ActionIcon, Center, LoadingOverlay, Pagination, Stack, Table } from '@mantine/core';
import dayjs from 'dayjs';
import { forwardRef, Ref, useEffect, useImperativeHandle, useState } from 'react';
import { InfoCircle, X } from 'tabler-icons-react';

import { mailsRequest } from '../../api/trackmail_request';
import { useFetch } from '../../hooks/useFetch';
import { errorNoDataFetchNotif, errorNotif } from '../../services/notification.services';
import { IMail, IMailResponse, IPagination } from '../../types/TrackMailType';

interface TrackMailListProps {
    token: string;
}

export interface TrackMailListRef {
    refreshTable: () => void;
}

export const TrackMailList = forwardRef(({ token }: TrackMailListProps, ref: Ref<TrackMailListRef>) => {
    const [targetPage, setTargetPage] = useState(0);
    const [paginationData, setPaginationData] = useState<IPagination>({
        numberPerPage: 0,
        offset: 0,
        page: 0,
        totalMail: 0,
    });
    const [mails, setMails] = useState<IMail[]>([]);
    const mailFetch = useFetch<IMailResponse>({
        onError(err) {
            errorNotif({ title: 'Failed to get mails', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            setMails(servData.data);
            setPaginationData(servData.pagination);
        },
    });

    const refreshTable = () => mailFetch.makeRequest(mailsRequest(targetPage, token));

    useEffect(() => {
        refreshTable();
    }, [targetPage]);

    useImperativeHandle(ref, () => ({ refreshTable }));

    const rows = mails.map((row: IMail) => (
        <tr key={row.email_id}>
            <td>{dayjs(row.created).format('DD/MM/YYYY [at] HH[h]mm')}</td>
            <td>{row.subject}</td>
            <td>{row.email_from}</td>
            <td>{row.email_to}</td>
            <td>
                {/* TODO */}
                <X color="red" />
            </td>
            <td>
                {/* TODO */}
                <ActionIcon color="blue">
                    <InfoCircle />
                </ActionIcon>
            </td>
        </tr>
    ));

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={mailFetch.isLoading} overlayBlur={2} />

            <Stack>
                {mails.length > 0 ? (
                    <>
                        <Table striped highlightOnHover sx={{ backgroundColor: 'white' }}>
                            <thead>
                                <tr>
                                    <th>Creation date</th>
                                    <th>Subject</th>
                                    <th>Sender email</th>
                                    <th>Recipients email</th>
                                    <th>Opened</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>

                        <Center>
                            <Pagination
                                page={paginationData.page + 1}
                                onChange={(newPage) => setTargetPage(newPage - 1)}
                                total={Math.ceil(paginationData.totalMail / paginationData.numberPerPage)}
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
