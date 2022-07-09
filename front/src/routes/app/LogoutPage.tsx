import { Space, Text } from '@mantine/core';
import { useEffect } from 'react';

import { useAuth } from '../../hooks/useAuth';

export function LogoutPage() {
    const { logout } = useAuth();

    useEffect(() => logout(), []);

    return (
        <>
            <Text size="xl">Logout</Text>
            <Space />
            <Text color="gray">You are going to be redirected...</Text>
        </>
    );
}
