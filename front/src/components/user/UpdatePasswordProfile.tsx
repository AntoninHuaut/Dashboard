import { Button, Group, PasswordInput } from '@mantine/core';
import { useEffect, useLayoutEffect, useState } from 'react';
import { CircleCheck, Key, Lock, Check, X } from 'tabler-icons-react';
import { handleInputChange } from '../../services/form.service';
import { IUpdatePasswordRequest } from '../../types/LoginType';
import { PasswordStrength, isValidPassword } from '../form/PasswordStength';
import { useFetch } from '../../api/request';
import { updateRequest } from '../../api/user_request';
import { useAuth } from '../../hooks/useAuth';
import { showNotification } from '@mantine/notifications';

interface UpdatePasswordProfileProps {
    closePasswordForm: () => any;
}

export function UpdatePasswordProfile(props: UpdatePasswordProfileProps) {
    const auth = useAuth();
    const [updatePass, setUpdatePass] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const updatePasswordFetch = useFetch();

    const onSubmit = () => updatePasswordFetch.makeRequest(updateRequest(auth.user.id, updatePass));

    const [errorConfirm, setErrorConfirm] = useState('');
    useEffect(
        () => setErrorConfirm(updatePass.newPassword === updatePass.confirmPassword ? '' : 'Passwords do not match'),
        [updatePass.newPassword, updatePass.confirmPassword]
    );

    const [isValidForm, setIsValidForm] = useState(false);
    useEffect(
        () =>
            setIsValidForm(
                updatePass.currentPassword.length > 0 && isValidPassword(updatePass.newPassword) && updatePass.newPassword === updatePass.confirmPassword
            ),
        [updatePass]
    );

    useLayoutEffect(() => {
        if (updatePasswordFetch.cannotHandleResult()) return;

        if (updatePasswordFetch.error) {
            showNotification({
                title: "Couldn't update password",
                message: updatePasswordFetch.error.message,
                color: 'red',
            });
        } else {
            showNotification({
                message: 'Your password has been updated',
                color: 'green',
            });
            props.closePasswordForm();
        }
    }, [updatePasswordFetch.isLoading]);

    return (
        <>
            <PasswordInput
                label="Current password"
                name="currentPassword"
                icon={<Lock />}
                placeholder="Your current password"
                value={updatePass.currentPassword}
                disabled={updatePasswordFetch.isLoading}
                onChange={(evt) => handleInputChange<IUpdatePasswordRequest>(evt, setUpdatePass)}
                required
            />

            <PasswordStrength
                mt="md"
                label="New password"
                name="newPassword"
                icon={<Key />}
                placeholder="Your new password"
                value={updatePass.newPassword}
                disabled={updatePasswordFetch.isLoading}
                onChange={(evt) => handleInputChange<IUpdatePasswordRequest>(evt, setUpdatePass)}
            />

            <PasswordInput
                label="Confirm password"
                name="confirmPassword"
                icon={<CircleCheck />}
                placeholder="Confirm your password"
                value={updatePass.confirmPassword}
                disabled={updatePasswordFetch.isLoading}
                onChange={(evt) => handleInputChange<IUpdatePasswordRequest>(evt, setUpdatePass)}
                error={errorConfirm}
                required
            />

            <Group mt="md" position="center">
                <Button
                    size="md"
                    color="lime"
                    leftIcon={<Check />}
                    disabled={!isValidForm || updatePasswordFetch.isLoading}
                    loading={updatePasswordFetch.isLoading}
                    onClick={onSubmit}>
                    Save
                </Button>
                <Button size="md" color="red" leftIcon={<X />} onClick={props.closePasswordForm} disabled={updatePasswordFetch.isLoading}>
                    Cancel
                </Button>
            </Group>
        </>
    );
}
