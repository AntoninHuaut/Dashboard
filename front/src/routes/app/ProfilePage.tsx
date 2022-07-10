import { Avatar, Badge, Button, Container, Group, MantineColor, Paper, Stack, Text, Title } from '@mantine/core';
import { useMemo, useState } from 'react';

import { UpdateFieldProfile } from '../../components/user/UpdateFieldsProfile';
import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../services/form.service';
import { UpdatePasswordProfile } from '../../components/user/UpdatePasswordProfile';

const ROLES_COLOR: { [key: string]: MantineColor } = {
    USER: 'blue',
    ADMIN: 'red',
};

function getRoleColor(role: string): MantineColor {
    return ROLES_COLOR[role] ?? 'gray';
}

export function ProfilePage() {
    const { user } = useAuth();
    const avatar = useMemo(() => getGravatarUrl(user.email), [user.email]);
    const [displayPasswordUpdate, setDisplayPasswordUpdate] = useState(false);

    return (
        <Stack>
            <Title order={1} align="center" my={30}>
                Information about you
            </Title>

            <Container>
                <Paper
                    style={{ width: 350 }}
                    radius="xl"
                    p="lg"
                    shadow="xl"
                    sx={(theme) => ({
                        backgroundColor: theme.colorScheme === 'light' ? theme.white : theme.colors.dark[8],
                    })}>
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

                        {!displayPasswordUpdate && (
                            <>
                                <UpdateFieldProfile />
                                <Button mt="md" onClick={() => setDisplayPasswordUpdate((v) => !v)}>
                                    Update my password
                                </Button>
                            </>
                        )}

                        {displayPasswordUpdate && (
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
