import { AppShell, Container, Space, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/layout/AppNavbar';
import { AppHeader } from '../components/layout/AppHeader';

interface AppLayoutProps {
    showNavbar: boolean;
}

export function AppLayout(props: AppLayoutProps) {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

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
            navbar={props.showNavbar ? <AppNavbar hiddenBreakpoint="sm" opened={opened} setOpened={setOpened} /> : undefined}
            header={<AppHeader opened={opened} setOpened={setOpened} />}>
            <Container fluid>
                <Space h="xl" />
                <Outlet />
            </Container>
        </AppShell>
    );
}
