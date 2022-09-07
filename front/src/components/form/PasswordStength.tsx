import { Box, PasswordInput, PasswordInputProps, Popover, Progress, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import { ChangeEventHandler, useState } from 'react';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text color={meets ? 'teal' : 'red'} sx={{ display: 'flex', alignItems: 'center' }} mt={7} size="sm">
            {meets ? <IconCheck /> : <IconX />} <Box ml={10}>{label}</Box>
        </Text>
    );
}

const MIN_PASSWORD_LENGTH = 8;

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

export function isValidPassword(password: string) {
    return getStrength(password) >= 100;
}

function getStrength(password: string) {
    let multiplier = password.length >= MIN_PASSWORD_LENGTH ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

interface PasswordStrengthProps extends PasswordInputProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function PasswordStrength(passwordInputProps: PasswordStrengthProps) {
    const { value } = passwordInputProps;
    const [popoverOpened, setPopoverOpened] = useState(false);
    const checks = requirements.map((requirement, index) => <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />);

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <Popover opened={popoverOpened} position="bottom" withArrow trapFocus={false} transition="pop-top-left">
            <Popover.Target>
                <div onFocusCapture={() => setPopoverOpened(true)} onBlurCapture={() => setPopoverOpened(false)}>
                    <PasswordInput
                        required
                        description="Strong password should include letters in lower and uppercase, at least 1 number, at least 1 special symbol"
                        {...passwordInputProps}
                    />
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} style={{ marginBottom: 10 }} />
                <PasswordRequirement label={`Includes at least ${MIN_PASSWORD_LENGTH} characters`} meets={value.length >= MIN_PASSWORD_LENGTH} />
                {checks}
            </Popover.Dropdown>
        </Popover>
    );
}
