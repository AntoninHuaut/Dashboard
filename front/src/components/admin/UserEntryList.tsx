import { Center, Group, LoadingOverlay, Pagination, Stack, Table, useMantineTheme } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import dayjs from 'dayjs';
import { forwardRef, Ref } from 'react';

import { usersRequest } from '../../api/user_request';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { IUser } from '../../types/LoginType';
import { IPaginationDataRef } from '../../types/PaginationData';
import { UserRolesComponent } from '../user/UserRolesComponent';

interface UserEntryListProps {}

export const UserEntryList = forwardRef((props: UserEntryListProps, ref: Ref<IPaginationDataRef>) => {
    const theme = useMantineTheme();
    const { data, dataFetch, paginationData, setTargetPage } = usePaginationFetch<IUser>({
        dataRequest: (targetPage: number) => usersRequest(targetPage),
        ref,
    });

    const rows = data.map((row: IUser) => (
        <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.email}</td>
            <td>{row.username}</td>
            <td>
                <Group spacing={2} align="center" mx="auto">
                    <UserRolesComponent user={row} />
                </Group>
            </td>
            <td>{dayjs(row.created_at).format('DD/MM/YYYY [at] HH[h]mm')}</td>
            <td>{dayjs(row.updated_at).format('DD/MM/YYYY [at] HH[h]mm')}</td>
            <td>{row.is_active ? <IconCheck color="green" /> : <IconX color="red" />}</td>
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
                                    <th>Id</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Roles</th>
                                    <th>Creation date</th>
                                    <th>Update date</th>
                                    <th>Active</th>
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
                    <Center>No user to display</Center>
                )}
            </Stack>
        </div>
    );
});
