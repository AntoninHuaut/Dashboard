import { Text } from '@mantine/core';

import { useAuth } from '../../hooks/useAuth';
import { IUser } from '../../types/LoginType';

export function HomePage() {
    const auth = useAuth();
    const user = auth.user as IUser; // Protected route

    return <Text size="xl">Hello {user.username}</Text>;
}
