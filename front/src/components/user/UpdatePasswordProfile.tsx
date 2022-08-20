import { Button, Group, PasswordInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Check, Key, Lock, X } from 'tabler-icons-react';

import { useFetch } from '../../hooks/useFetch';
import { updateRequest } from '../../api/user_request';
import { useAuth } from '../../hooks/useAuth';
import { useCaptcha } from '../../hooks/useCaptcha';
import { handleInputChange } from '../../services/form.service';
import { CaptchaAction } from '../../types/CaptchaType';
import { IUpdatePasswordRequest, IUser } from '../../types/LoginType';
import { ConfirmPassword } from '../form/ConfirmPassword';
import { isValidPassword, PasswordStrength } from '../form/PasswordStength';
import { errorNotif, successNotif } from '../../services/notification.services';

interface UpdatePasswordProfileProps {
    closePasswordForm: () => any;
}

export function UpdatePasswordProfile(props: UpdatePasswordProfileProps) {
    const auth = useAuth();
    const user = auth.user as IUser; // Protected route
    const [updatePass, setUpdatePass] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const updatePasswordFetch = useFetch({
        onError(error) {
            errorNotif({
                title: "Couldn't update password",
                message: error.message,
            });
        },
        onSuccess(_data) {
            successNotif({
                message: 'Your password has been updated',
            });
            props.closePasswordForm();
        },
    });

    const onSubmit = useCaptcha(CaptchaAction.UpdateProfile, async (captcha: string) => {
        updatePasswordFetch.makeRequest(updateRequest(user.id, updatePass, captcha));
        onSubmit(false);
    });

    const [isValidForm, setIsValidForm] = useState(false);
    useEffect(
        () =>
            setIsValidForm(
                updatePass.currentPassword.length > 0 && isValidPassword(updatePass.newPassword) && updatePass.newPassword === updatePass.confirmPassword
            ),
        [updatePass]
    );

    return (
        <>
            <PasswordInput
                mt="sm"
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

            <ConfirmPassword
                password={updatePass.newPassword}
                confirmPassword={updatePass.confirmPassword}
                onChange={(evt) => handleInputChange<IUpdatePasswordRequest>(evt, setUpdatePass)}
                disabled={updatePasswordFetch.isLoading}
            />

            <Group mt="md" position="center">
                <Button
                    size="md"
                    color="lime"
                    leftIcon={<Check />}
                    disabled={!isValidForm || updatePasswordFetch.isLoading}
                    loading={updatePasswordFetch.isLoading}
                    onClick={() => onSubmit(true)}>
                    Save
                </Button>
                <Button size="md" color="red" leftIcon={<X />} onClick={props.closePasswordForm} disabled={updatePasswordFetch.isLoading}>
                    Cancel
                </Button>
            </Group>
        </>
    );
}
