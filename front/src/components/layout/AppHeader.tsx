import { Avatar, Burger, Group, Header, MediaQuery, Title, useMantineTheme } from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '../../hooks/useAuth';

interface AppHeaderProps {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
}

export function AppHeader(props: AppHeaderProps) {
    const theme = useMantineTheme();
    const auth = useAuth();
    const { opened, setOpened } = props;

    return (
        <Header height={56} px="md">
            <div style={{ height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {auth.user && (
                    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                        <Burger opened={opened} onClick={() => setOpened((v) => !v)} size="sm" color={theme.colors.gray[6]} />
                    </MediaQuery>
                )}

                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Group position="apart">
                        <Link to={'/'}>
                            <Avatar size={32} radius={32} src={'/logo.svg'} />
                        </Link>
                        <Title order={4}>Dashboard</Title>
                    </Group>
                </MediaQuery>

                <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                    <Group position="apart">
                        <Link to={'/'}>
                            <Avatar size={42} radius={42} src={'/logo.svg'} />
                        </Link>
                        <Title order={2}>Dashboard</Title>
                    </Group>
                </MediaQuery>

                <Group>
                    <ThemeSwitcher />
                </Group>
            </div>
        </Header>
    );
}
