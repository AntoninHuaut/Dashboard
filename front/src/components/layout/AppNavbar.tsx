import { Avatar, Code, createStyles, Divider, Group, MantineNumberSize, Navbar } from '@mantine/core';
import { IconAdjustments, IconHome, IconLogout, IconMail, IconUserCircle, TablerIcon } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../services/form.service';
import { IUser, UserRole } from '../../types/LoginType';

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

interface ILinkData {
    link: string;
    label: string;
    icon: TablerIcon;
    roles?: UserRole[];
    elements?: { pre?: React.ReactNode; post?: React.ReactNode };
}

interface ILinkCreateParams {
    item: ILinkData;
    active: string;
    user: IUser;
    classes: Record<'header' | 'footer' | 'link' | 'linkIcon' | 'linkActive', string>;
    cx: (...args: any) => string;
    setOpened: (v: boolean) => any;
    navigate: (v: string) => any;
}

const data: ILinkData[] = [
    { link: '/app/admin', label: 'Admin', icon: IconAdjustments, roles: [UserRole.ADMIN], elements: { post: <Divider mt="sm" mb="sm" /> } },
    { link: '/app/home', label: 'Home', icon: IconHome },
    { link: '/app/profile', label: 'Profile', icon: IconUserCircle },
    { link: '/app/track-mail', label: 'TrackMail', icon: IconMail },
];

interface AppNavbarProps {
    setOpened: (v: boolean) => any;
    opened: boolean;
    hiddenBreakpoint: MantineNumberSize;
}

function createLink({ item, active, user, classes, cx, setOpened, navigate }: ILinkCreateParams) {
    const requireRoles = item.roles ?? [];
    if (requireRoles.length > 0 && !user.roles.some((role) => requireRoles.includes(role as UserRole))) {
        return null;
    }

    return (
        <>
            {item.elements?.pre}
            <a
                className={cx(classes.link, { [classes.linkActive]: item.label === active })}
                href={item.link}
                key={item.label}
                onClick={(evt) => {
                    evt.preventDefault();
                    setOpened(false);
                    navigate(item.link);
                }}>
                <item.icon className={classes.linkIcon} />
                <span>{item.label}</span>
            </a>
            {item.elements?.post}
        </>
    );
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
        const active = data.find(({ link }) => path.startsWith(link));
        setActive(active ? active.label : '');
    }, [location.pathname]);

    const links = data.map((item) => createLink({ item, active, user, classes, cx, setOpened, navigate })).filter((item) => item !== null);

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
                        setOpened(false);
                        navigate('/app/logout');
                    }}>
                    <IconLogout className={classes.linkIcon} />
                    <span>Logout</span>
                </a>
            </Navbar.Section>
        </Navbar>
    );
}
