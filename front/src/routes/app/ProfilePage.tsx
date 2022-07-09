import { Avatar, Badge, Container, Group, MantineColor, Paper, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';

import { UpdateFieldProfile } from '../../components/user/UpdateFieldsProfile';
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
    const avatar = useMemo(() => getGravatarUrl(user.email), [user.email]);

    return (
        <Stack>
            <Title order={1} align="center" my={30}>
                Information about you
            </Title>

            <Container>
                <Paper style={{ width: 350 }} radius="md" p="lg" shadow="xl">
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

                        <UpdateFieldProfile />
                    </Stack>
                </Paper>
            </Container>
        </Stack>
    );
}
