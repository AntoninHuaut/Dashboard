import { AppShell, Header, Group, Avatar, Title, useMantineTheme, Container, Space } from '@mantine/core';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export const UnProtectedLayout = () => {
    const theme = useMantineTheme();
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/app/home" />;
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
            header={
                <Header height={70} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
