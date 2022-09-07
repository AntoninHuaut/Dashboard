import { ActionIcon, Button, Center, Group, LoadingOverlay, Menu, Pagination, Stack, Table, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconTrashX, IconX } from '@tabler/icons';
import dayjs from 'dayjs';
import { forwardRef, Ref, useEffect, useState } from 'react';

import { deleteRequest, usersRequest } from '../../api/user_request';
import { useAuth } from '../../hooks/useAuth';
import { useCaptcha } from '../../hooks/useCaptcha';
import { useFetch } from '../../hooks/useFetch';
import { usePaginationFetch } from '../../hooks/usePaginationFetch';
import { errorNotif, successNotif } from '../../services/notification.services';
import { CaptchaAction } from '../../types/CaptchaType';
import { IUser } from '../../types/LoginType';
import { IPaginationDataRef } from '../../types/PaginationData';
import { UserRolesComponent } from '../user/UserRolesComponent';

export const UserEntryList = forwardRef((_: {}, ref: Ref<IPaginationDataRef>) => {
    const auth = useAuth();
    const user = auth.user as IUser; // Protected route

    const displayUserDate = useMediaQuery('(min-width: 1200px)');
    const displayUserIdName = useMediaQuery('(min-width: 800px)');

    const theme = useMantineTheme();
    const { data, dataFetch, paginationData, setTargetPage, refreshData } = usePaginationFetch<IUser>({
        dataRequest: (targetPage: number) => usersRequest(targetPage),
        ref,
    });
    const deleteUserFetch = useFetch({
        onError(err) {
            errorNotif({ title: 'Failed to delete user', message: err.message });
        },
        onSuccess(_data) {
            successNotif({ title: 'Success', message: 'User has been deleted' });
            refreshData();
        },
    });

    const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
    const onDeleteSubmit = useCaptcha(CaptchaAction.DeleteAccount, async (captcha: string) => {
        if (!userToDelete) return;

        deleteUserFetch.makeRequest(deleteRequest(userToDelete.id, captcha));
        setUserToDelete(null);
        onDeleteSubmit(false);
    });

    useEffect(() => {
        if (!userToDelete) return;

        onDeleteSubmit(true);
    }, [userToDelete]);

    const rows = data.map((row: IUser) => (
        <tr key={row.id}>
            {displayUserIdName && <td>{row.id}</td>}
            <td>{row.email}</td>
            {displayUserIdName && <td>{row.username}</td>}
            <td>
                <Group spacing={2} align="center" mx="auto">
                    <UserRolesComponent user={row} />
                </Group>
            </td>
            {displayUserDate && (
                <>
                    <td>{dayjs(row.created_at).format('DD/MM/YYYY [at] HH[h]mm')}</td>
                    <td>{dayjs(row.updated_at).format('DD/MM/YYYY [at] HH[h]mm')}</td>
                </>
            )}
            <td>{row.is_active ? <IconCheck color="green" /> : <IconX color="red" />}</td>
            <td>
                {user.id !== row.id && (
                    <Menu shadow="md" width={205}>
                        <Menu.Target>
                            <Tooltip label="Delete">
                                <ActionIcon color="red" variant="light">
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
                                    <Button color="red" onClick={() => setUserToDelete(row)}>
                                        Delete
                                    </Button>
                                </Group>
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
            </td>
        </tr>
    ));

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={dataFetch.isLoading || deleteUserFetch.isLoading} overlayBlur={2} />

            <Stack>
                {data.length > 0 ? (
                    <>
                        <Table highlightOnHover sx={{ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white' }}>
                            <thead>
                                <tr>
                                    {displayUserIdName && <th>Id</th>}
                                    <th>Email</th>
                                    {displayUserIdName && <th>Username</th>}
                                    <th>Roles</th>
                                    {displayUserDate && (
                                        <>
                                            <th>Creation date</th>
                                            <th>Update date</th>
                                        </>
                                    )}
                                    <th>Active</th>
                                    <th></th>
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
