import { Avatar, Burger, Group, Header, MediaQuery, Title, useMantineTheme } from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface AppHeaderProps {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
}

export function AppHeader(props: AppHeaderProps) {
    const theme = useMantineTheme();
    const { opened, setOpened } = props;

    return (
        <Header height={56} px="md">
            <div style={{ height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Group>
                    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                        <Burger opened={opened} onClick={() => setOpened((v) => !v)} size="sm" color={theme.colors.gray[6]} mr="xl" />
                    </MediaQuery>

                    <Group position="apart">
                        <Avatar size={42} src={'/logo.svg'} radius={42} />
                        <Title order={2}>LearningReact</Title>
                    </Group>
                </Group>

                <Group>
                    <ThemeSwitcher />
                </Group>
            </div>
        </Header>
    );
}
