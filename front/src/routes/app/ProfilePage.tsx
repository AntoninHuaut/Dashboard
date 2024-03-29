import { Avatar, Badge, Button, Group, LoadingOverlay, MantineColor, Paper, Stack, Text, Title } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteRequest } from '../../api/user_request';
import { UpdateFieldProfile } from '../../components/user/UpdateFieldsProfile';
import { UpdatePasswordProfile } from '../../components/user/UpdatePasswordProfile';
import { UserRolesComponent } from '../../components/user/UserRolesComponent';
import { useAuth } from '../../hooks/useAuth';
import { useCaptcha } from '../../hooks/useCaptcha';
import { useFetch } from '../../hooks/useFetch';
import { getGravatarUrl } from '../../services/form.service';
import { errorNotif, successNotif } from '../../services/notification.services';
import { CaptchaAction } from '../../types/CaptchaType';
import { IUser } from '../../types/LoginType';

export function ProfilePage() {
    const auth = useAuth();
    const user = auth.user as IUser; // Protected route
    const navigate = useNavigate();
    const modals = useModals();
    const avatar = useMemo(() => getGravatarUrl(user.email), [user.email]);
    const [displayPasswordUpdate, setDisplayPasswordUpdate] = useState(false);

    const deleteFetch = useFetch({
        onError(error) {
            errorNotif({
                title: "Couldn't delete account",
                message: error.message,
            });
        },
        onSuccess(_data) {
            setIsDeleted(true);
            const autoCloseDelay = successNotif({
                title: 'Your account has been deleted',
                message: 'You will be redirected to the login page',
            });

            setTimeout(() => navigate('/app/logout'), autoCloseDelay);
        },
    });

    const deleteAccount = useCaptcha(CaptchaAction.DeleteAccount, async (captcha: string) => {
        await deleteFetch.makeRequest(deleteRequest(user.id, captcha));
        deleteAccount(false);
    });

    const [isDeleted, setIsDeleted] = useState(false);

    const openDeleteModal = () =>
        modals.openConfirmModal({
            title: 'Delete your profile',
            centered: true,
            children: <Text size="sm">Are you sure you want to delete your profile? This action is irreversible.</Text>,
            labels: { confirm: 'Delete account', cancel: "No don't delete it" },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteAccount(true),
        });

    return (
        <Stack>
            <Title order={1} align="center" my={30}>
                Information about you
            </Title>

            <Paper
                style={{ position: 'relative' }}
                radius="xl"
                p="lg"
                mx="auto"
                shadow="xl"
                sx={(theme) => ({
                    [theme.fn.largerThan('md')]: {
                        width: 600,
                    },
                    [theme.fn.smallerThan('md')]: {
                        width: 450,
                    },
                    [theme.fn.smallerThan('xs')]: {
                        width: 300,
                    },
                })}>
                <LoadingOverlay visible={deleteFetch.isLoading} />

                <Stack spacing="sm">
                    <Avatar size={128} src={avatar} radius={128} mt="md" mx="auto" mb="sm" />
                    <Text align="center" size="xl" weight={700}>
                        {user.username}
                    </Text>

                    <Group spacing="xs" mb="md" align="center" mx="auto">
                        <UserRolesComponent user={user} />
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
        </Stack>
    );
}
