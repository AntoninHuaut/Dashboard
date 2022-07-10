import { Avatar, Badge, Button, Container, Group, LoadingOverlay, MantineColor, Paper, Stack, Text, Title } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFetch } from '../../api/request';
import { deleteRequest } from '../../api/user_request';
import { UpdateFieldProfile } from '../../components/user/UpdateFieldsProfile';
import { UpdatePasswordProfile } from '../../components/user/UpdatePasswordProfile';
import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../services/form.service';

const ROLES_COLOR: { [key: string]: MantineColor } = {
    USER: 'blue',
    ADMIN: 'red',
};

function getRoleColor(role: string): MantineColor {
    return ROLES_COLOR[role] ?? 'gray';
}

export function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const deleteFetch = useFetch();
    const modals = useModals();
    const avatar = useMemo(() => getGravatarUrl(user.email), [user.email]);
    const [displayPasswordUpdate, setDisplayPasswordUpdate] = useState(false);

    const deleteAccount = () => deleteFetch.makeRequest(deleteRequest(user.id));

    const [isDeleted, setIsDeleted] = useState(false);

    const openDeleteModal = () =>
        modals.openConfirmModal({
            title: 'Delete your profile',
            centered: true,
            children: <Text size="sm">Are you sure you want to delete your profile? This action is irreversible.</Text>,
            labels: { confirm: 'Delete account', cancel: "No don't delete it" },
            confirmProps: { color: 'red' },
            onConfirm: deleteAccount,
        });

    useEffect(() => {
        if (deleteFetch.cannotHandleResult()) return;

        if (deleteFetch.error) {
            showNotification({
                title: "Couldn't delete account",
                message: deleteFetch.error.message,
                color: 'red',
            });
        } else {
            setIsDeleted(true);
            showNotification({
                title: 'Your account has been deleted',
                message: 'You will be redirected to the login page',
                color: 'green',
            });

            setTimeout(() => navigate('/app/logout'), 3000);
        }
    }, [deleteFetch.isLoading]);

    return (
        <Stack>
            <Title order={1} align="center" my={30}>
                Information about you
            </Title>

            <Container>
                <Paper
                    style={{ width: 350, position: 'relative' }}
                    radius="xl"
                    p="lg"
                    shadow="xl"
                    sx={(theme) => ({
                        backgroundColor: theme.colorScheme === 'light' ? theme.white : theme.colors.dark[8],
                    })}>
                    <LoadingOverlay visible={deleteFetch.isLoading} />

                    <Stack spacing="sm">
                        <Avatar size={128} src={avatar} radius={128} mt="md" mx="auto" mb="sm" />
                        <Text align="center" size="xl" weight={700}>
                            {user.username}
                        </Text>

                        <Group spacing="xs" mb="md" align="center" mx="auto">
                            {user.roles.length > 0 &&
                                user.roles.sort().map((role: string) => (
                                    <Badge key={role} color={getRoleColor(role)}>
                                        {role}
                                    </Badge>
                                ))}
                        </Group>

                        {!isDeleted && !displayPasswordUpdate && (
                            <>
                                <UpdateFieldProfile />

                                <Group mt="md" position="center">
                                    <Button onClick={() => setDisplayPasswordUpdate((v) => !v)}>Update password</Button>

                                    <Button color="red" onClick={openDeleteModal}>
                                        Delete account
                                    </Button>
                                </Group>
                            </>
                        )}

                        {!isDeleted && displayPasswordUpdate && (
                            <>
                                <UpdatePasswordProfile closePasswordForm={() => setDisplayPasswordUpdate(false)} />
                            </>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </Stack>
    );
}
