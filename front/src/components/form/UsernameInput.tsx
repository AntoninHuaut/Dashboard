import { TextInput, TextInputProps } from '@mantine/core';
import { IconUser } from '@tabler/icons';
import { ChangeEventHandler, useEffect, useState } from 'react';

interface UsernameInputProps extends TextInputProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function isValidUsername(value: string) {
    return value.trim().length >= 3;
}

export function UsernameInput(props: UsernameInputProps) {
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');

        const validUsername = isValidUsername(props.value);
        if (validUsername || props.value.trim().length === 0) return;

        const timeOutId = setTimeout(() => setError('Your username must be at least 3 characters long'), 500);
        return () => clearTimeout(timeOutId);
    }, [props.value]);

    return <TextInput label="Username" name="username" placeholder="Your username" icon={<IconUser />} required error={error} {...props} />;
}
