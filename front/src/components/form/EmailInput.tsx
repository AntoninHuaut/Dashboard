import { TextInput, TextInputProps } from '@mantine/core';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { Mail } from 'tabler-icons-react';

interface EmailInputProps extends TextInputProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function isValidEmail(value: string) {
    return /[a-z0-9]+@[a-z]+\.[a-z]/i.test(value);
}

export function EmailInput(props: EmailInputProps) {
    const [error, setError] = useState('');

    useEffect(() => setError(isValidEmail(props.value) ? '' : 'Please enter a valid email'), [props.value]);

    return <TextInput type="email" label="Email" name="email" placeholder="you@provider.com" icon={<Mail />} required error={error} {...props} />;
}
