import { ActionIcon, Container, Group, Space, Text, Title, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons';
import { useRef } from 'react';
import { Navigate } from 'react-router';

import { UserEntryList } from '../../components/admin/UserEntryList';
import { useAuth } from '../../hooks/useAuth';
import { IUser, UserRole } from '../../types/LoginType';
import { IPaginationDataRef } from '../../types/PaginationData';

export function AdminPage() {
    const auth = useAuth();
    const user = auth.user as IUser; // Protected route

    if (!user.roles.includes(UserRole.ADMIN)) {
        return <Navigate to="/" />;
    }

    const paginationChildRef = useRef<IPaginationDataRef>(null);

    return (
        <>
            <Title order={1} align="center">
                Administration
            </Title>

            <Space h="xl" />

            <Group spacing="xs" position="center">
                <Tooltip label="Refresh user list">
                    <ActionIcon color="blue" onClick={() => paginationChildRef.current?.refreshData()}>
                        <IconRefresh />
                    </ActionIcon>
                </Tooltip>
                <Text weight={600} size="xl">
                    User list
                </Text>
            </Group>

            <Space h="xl" />

            <UserEntryList ref={paginationChildRef} />
        </>
    );
}
