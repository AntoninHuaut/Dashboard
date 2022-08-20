import { createStyles, UnstyledButton, Text, Center, useMantineColorScheme, Group, MediaQuery, ActionIcon } from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import { Moon, Sun } from 'tabler-icons-react';
import { useAuth } from '../../hooks/useAuth';

const useStyles = createStyles((theme) => ({
    control: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 1000,
        paddingLeft: theme.spacing.sm,
        paddingRight: 4,
        width: 136,
        height: 45,
    },

    iconWrapper: {
        height: 28,
        width: 28,
        borderRadius: 28,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.dark[4],
        color: theme.colorScheme === 'dark' ? theme.black : theme.colors.blue[2],
    },

    value: {
        lineHeight: 1,
    },
}));

export function ThemeSwitcher() {
    const { user } = useAuth();
    const { classes } = useStyles();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const Icon = colorScheme === 'dark' ? Sun : Moon;

    const toggleThemeTrack = () => {
        toggleColorScheme();
    };

    return (
        <Group position="center" my="xl">
            <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                <UnstyledButton aria-label="Toggle theme" className={classes.control} onClick={toggleThemeTrack} title="Ctrl + J">
                    <Text size="sm" className={classes.value}>
                        {upperFirst(colorScheme === 'light' ? 'dark' : 'light')} theme
                    </Text>

                    <Center className={classes.iconWrapper}>
                        <Icon size={18} />
                    </Center>
                </UnstyledButton>
            </MediaQuery>

            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Group position="center" my="xl">
                    <ActionIcon
                        onClick={toggleThemeTrack}
                        size="lg"
                        sx={(theme) => ({
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                            color: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
                        })}>
                        <Icon size={18} />
                    </ActionIcon>
                </Group>
            </MediaQuery>
        </Group>
    );
}
