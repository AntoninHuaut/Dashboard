import { ActionIcon, Avatar, Badge, Container, DefaultMantineColor, Group, MantineColor, Paper, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useMemo, useState } from 'react';
import { Check, Edit, Mail, User, X } from 'tabler-icons-react';

import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../services/form.service';

const ROLES_COLOR: { [key: string]: MantineColor } = {
    USER: "blue",
    ADMIN: "red",
}

function getRoleColor(role: string): MantineColor {
    return ROLES_COLOR[role] ?? "gray";
}

function createEditButton(editField: boolean, setEditField: (value: boolean) => any, primaryColor: DefaultMantineColor) {
    const validateChange = () => {
        setEditField(!editField);
    }

    return (
        <>
            {!editField && <ActionIcon color={primaryColor} variant="filled" size="md" onClick={validateChange}>
                <Edit />
            </ActionIcon>
            }

            {editField &&
                <>
                    <ActionIcon color={"lime"} variant="filled" size="md" mr="2px" onClick={validateChange}>
                        <Check />
                    </ActionIcon>
                    <ActionIcon color={"red"} variant="filled" size="md" onClick={validateChange}>
                        <X />
                    </ActionIcon>
                </>
            }
        </>
    )
}

export function ProfilePage() {
    const { user } = useAuth();
    const theme = useMantineTheme();

    const [editEmail, setEditEmail] = useState(false);
    const [editUsername, setEditUsername] = useState(false);

    const editButton = (editField: boolean, setEditField: (value: boolean) => any) => {
        return createEditButton(editField, setEditField, theme.primaryColor);
    }

    const avatar = useMemo(() => getGravatarUrl(user.email), [user.email]);

    return (<Stack>
        <Title order={1} align="center" my={30}>
            Information about you
        </Title>

        <Container>
            <Paper style={{ width: 350 }} radius="md" p="lg" shadow="xl">
                <Stack spacing="sm" >
                    <Avatar size={128} src={avatar} radius={128} mt="md" mx="auto" mb="sm" />
                    <Text align="center" size="xl" weight={700}>
                        {user.username}
                    </Text>

                    <Group spacing="xs" mb="md" align="center" mx="auto" >
                        {user.roles.length > 0 && user.roles.sort().map((role: string) => (
                            <Badge key={role} color={getRoleColor(role)} >
                                {role}
                            </Badge>
                        ))}
                    </Group>

                    <TextInput
                        icon={<Mail size={16} />}
                        placeholder="Your email"
                        value={user.email}
                        rightSection={editButton(editEmail, setEditEmail)}
                        rightSectionWidth={editEmail ? 67 : 40}
                        disabled={!editEmail}
                        mt="sm"
                    />

                    <TextInput
                        icon={<User size={16} />}
                        placeholder="Your username"
                        value={user.username}
                        rightSection={editButton(editUsername, setEditUsername)}
                        rightSectionWidth={editUsername ? 67 : 40}
                        disabled={!editUsername}
                        mt="sm"
                    />
                </Stack>
            </Paper>
        </Container>
    </Stack>
    );
}
