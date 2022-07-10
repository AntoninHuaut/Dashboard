import { Input } from '@mantine/core';
import { TextInputProps } from '@mantine/core/lib/components/TextInput';
import { ChangeEventHandler } from 'react';
import { Mail } from 'tabler-icons-react';

export function isValidEmail(value: string) {
    return /^[a-z0-9.]{1,64}@[a-z0-9.]{1,64}$/i.test(value);
}

interface EmailInputProps extends TextInputProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function EmailInput(props: EmailInputProps) {
    const { value } = props;

    return <Input type="email" label="email" name="email" placeholder="you@provider.com" icon={<Mail />} required invalid={!isValidEmail(value)} {...props} />;
}
