import { AppShell, Burger, Container, Header, MediaQuery, Space, useMantineTheme, Group, Avatar, Title } from '@mantine/core';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { AppNavbar } from '../components/AppNavbar';
import { useAuth } from '../hooks/useAuth';

export const ProtectedLayout = () => {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    return (
        <AppShell
            styles={{
                main: {
                    background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                },
            }}
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            fixed
            navbar={<AppNavbar hiddenBreakpoint="sm" opened={opened} setOpened={setOpened} />}
            header={
                <Header height={70} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                            <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm" color={theme.colors.gray[6]} mr="xl" />
                        </MediaQuery>

                        <Group position="apart">
                            <Avatar size={48} src={'/logo.svg'} radius={48} />
                            <Title order={2}>LearningReact</Title>
                        </Group>
                    </div>
                </Header>
            }>
            <Container fluid>
                <Space h="xl" />
                <Outlet />
            </Container>
        </AppShell>
    );
};
