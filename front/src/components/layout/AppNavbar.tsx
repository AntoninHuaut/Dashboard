import { Avatar, Code, createStyles, Group, MantineNumberSize, Navbar } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Logout, UserCircle } from 'tabler-icons-react';

import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../services/form.service';
import { safeTrack } from '../../services/umami.service';
import { IUser } from '../../types/LoginType';

const useStyles = createStyles((theme, _params, getRef) => {
    const icon = getRef('icon');
    return {
        header: {
            paddingBottom: theme.spacing.md,
            marginBottom: theme.spacing.md * 1.5,
            borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        },

        footer: {
            paddingTop: theme.spacing.md,
            marginTop: theme.spacing.md,
            borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        },

        link: {
            ...theme.fn.focusStyles(),
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: theme.fontSizes.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            borderRadius: theme.radius.sm,
            fontWeight: 500,

            '&:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,

                [`& .${icon}`]: {
                    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
                },
            },
        },

        linkIcon: {
            ref: icon,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
            marginRight: theme.spacing.sm,
        },

        linkActive: {
            '&, &:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25) : theme.colors[theme.primaryColor][0],
                color: theme.colorScheme === 'dark' ? theme.white : theme.colors[theme.primaryColor][7],
                [`& .${icon}`]: {
                    color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 7],
                },
            },
        },
    };
});

const data = [
    { link: '/app/home', label: 'Home', icon: Home },
    { link: '/app/profile', label: 'Profile', icon: UserCircle },
];

interface AppNavbarProps {
    setOpened: (v: boolean) => any;
    opened: boolean;
    hiddenBreakpoint: MantineNumberSize;
}

export function AppNavbar(props: AppNavbarProps) {
    const { setOpened, opened, hiddenBreakpoint } = props;

    const auth = useAuth();
    const user = auth.user as IUser; // Protected route
    const navigate = useNavigate();
    const location = useLocation();
    const { classes, cx } = useStyles();
    const [active, setActive] = useState('');

    useEffect(() => {
        const path = location.pathname;
        const active = data.find(({ link }) => link === path);
        setActive(active ? active.label : '');
    }, [location.pathname]);

    const links = data.map((item) => (
        <a
            className={cx(classes.link, { [classes.linkActive]: item.label === active })}
            href={item.link}
            key={item.label}
            onClick={(evt) => {
                evt.preventDefault();
                safeTrack(`navbar-${item.label.toLowerCase()}`, 'click');
                setOpened(false);
                navigate(item.link);
            }}>
            <item.icon className={classes.linkIcon} />
            <span>{item.label}</span>
        </a>
    ));

    return (
        <Navbar width={{ sm: 200, lg: 250 }} p="md" hidden={!opened} hiddenBreakpoint={hiddenBreakpoint}>
            <Navbar.Section grow>
                <Group className={classes.header} position="left">
                    <Avatar size={48} src={getGravatarUrl(user.email)} radius={48} />
                    <Code sx={{ fontWeight: 700 }}>{user.username}</Code>
                </Group>
                {links}
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
                <a
                    href="/app/logout"
                    className={classes.link}
                    onClick={(event) => {
                        event.preventDefault();
                        safeTrack('navbar-logout', 'click');
                        setOpened(false);
                        navigate('/app/logout');
                    }}>
                    <Logout className={classes.linkIcon} />
                    <span>Logout</span>
                </a>
            </Navbar.Section>
        </Navbar>
    );
}
