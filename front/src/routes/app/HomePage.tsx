import { Text } from '@mantine/core';

import { useAuth } from '../../hooks/useAuth';

export function HomePage() {
    const { user } = useAuth();

    return <Text size="xl">
        Hello {user.username}
    </Text>
}
