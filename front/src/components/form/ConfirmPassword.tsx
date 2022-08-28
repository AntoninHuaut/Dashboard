import { PasswordInput, PasswordInputProps } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons';
import { ChangeEvent, useEffect, useState } from 'react';

interface ConfirmPasswordHTMLProps extends PasswordInputProps {
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

interface ConfirmPasswordProps extends ConfirmPasswordHTMLProps {
    password: string;
    confirmPassword: string;
}

function extractHTMLProps(props: ConfirmPasswordProps): ConfirmPasswordHTMLProps {
    const htmlProps: any = { ...props };
    delete htmlProps.password;
    delete htmlProps.confirmPassword;
    return htmlProps;
}

export function ConfirmPassword(props: ConfirmPasswordProps) {
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');

        const valid = props.password === props.confirmPassword;
        if (valid || props.confirmPassword.length === 0) return;

        const timeOutId = setTimeout(() => setError('Passwords do not match'), 500);
        return () => clearTimeout(timeOutId);
    }, [props.password, props.confirmPassword]);

    return (
        <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            icon={<IconCircleCheck />}
            placeholder="Confirm your password"
            error={error}
            value={props.confirmPassword}
            {...extractHTMLProps(props)}
            required
        />
    );
}
