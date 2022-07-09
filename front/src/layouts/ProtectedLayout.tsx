import { AppShell, Container, Space } from '@mantine/core';
import { Navigate, Outlet } from 'react-router-dom';

import { AppNavbar } from '../components/AppNavbar';
import { useAuth } from '../hooks/useAuth';

export const ProtectedLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    return (
        <AppShell fixed navbar={<AppNavbar />}>
            <Container fluid>
                <Space h="xl" />
                <Outlet />
            </Container>
        </AppShell>
    );
};
