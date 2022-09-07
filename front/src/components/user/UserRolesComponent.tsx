import { Badge, MantineColor } from '@mantine/core';
import { IUser } from '../../types/LoginType';

const ROLES_COLOR: { [key: string]: MantineColor } = {
    USER: 'blue',
    ADMIN: 'red',
};

function getRoleColor(role: string): MantineColor {
    return ROLES_COLOR[role] ?? 'gray';
}

interface UserRolesComponentProps {
    user: IUser;
}

export function UserRolesComponent({ user }: UserRolesComponentProps) {
    return (
        <>
            {user.roles.length > 0 &&
                user.roles.sort().map((role: string) => (
                    <Badge key={role} color={getRoleColor(role)}>
                        {role}
                    </Badge>
                ))}
        </>
    );
}
