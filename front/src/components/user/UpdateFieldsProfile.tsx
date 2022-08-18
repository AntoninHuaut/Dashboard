import { ActionIcon, useMantineTheme } from '@mantine/core';
import { ChangeEvent, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Check, Edit, X } from 'tabler-icons-react';

import { updateRequest } from '../../api/user_request';
import { useAuth } from '../../hooks/useAuth';
import { useCaptcha } from '../../hooks/useCaptcha';
import { useFetch } from '../../hooks/useFetch';
import { errorNotif, successNotif } from '../../services/notification.services';
import { safeTrack } from '../../services/umami.service';
import { CaptchaAction } from '../../types/CaptchaType';
import { IUser } from '../../types/LoginType';
import { EmailInput, isValidEmail } from '../form/EmailInput';
import { isValidUsername, UsernameInput } from '../form/UsernameInput';

type FieldNameType = 'email' | 'username';

export function UpdateFieldProfile() {
    const auth = useAuth();
    const user = auth.user as IUser; // Protected route
    const theme = useMantineTheme();
    const updateFetch = useFetch({
        onError(error) {
            errorNotif({
                title: 'An error occurred while updating your data',
                message: error.message,
            });
        },
        onSuccess(_data) {
            setEditFieldName('');
            successNotif({
                message: 'Your data has been updated',
            });
        },
    });

    const [email, setEmail] = useState(user.email);
    const [username, setUsername] = useState(user.username);

    const [isLoading, setLoading] = useState(false);
    const [isValidInput, setValidInput] = useState(true);
    const [editFieldName, setEditFieldName] = useState<string>('');

    const editButton = useCallback(
        (fieldName: FieldNameType, fieldValue: string, setFieldValue: (value: string) => void) => {
            const validateChange = async (captcha: string) => {
                safeTrack(`update-account`, { userId: user.id, label: fieldName.toLowerCase() });
                setLoading(true);
                await updateFetch.makeRequest(updateRequest(user.id, { [fieldName]: fieldValue }, captcha));
                await auth.refreshUser();
                setLoading(false);
            };

            const onSubmit = useCaptcha(CaptchaAction.UpdateProfile, async (captcha: string) => {
                await validateChange(captcha);
                onSubmit(false);
            });

            const cancelChange = () => {
                setFieldValue(user[fieldName]);
                setEditFieldName('');
            };

            return (
                <>
                    {editFieldName !== fieldName && (
                        <ActionIcon
                            color={theme.primaryColor}
                            variant="filled"
                            size="md"
                            onClick={() => setEditFieldName(fieldName)}
                            disabled={editFieldName.length > 0}>
                            <Edit />
                        </ActionIcon>
                    )}

                    {editFieldName === fieldName && !isLoading && (
                        <>
                            <ActionIcon color={'lime'} variant="filled" size="md" mr="2px" onClick={() => onSubmit(true)} disabled={isLoading || !isValidInput}>
                                <Check />
                            </ActionIcon>
                            <ActionIcon color={'red'} variant="filled" size="md" onClick={cancelChange} disabled={isLoading || !isValidInput}>
                                <X />
                            </ActionIcon>
                        </>
                    )}

                    {editFieldName === fieldName && isLoading && (
                        <>
                            <ActionIcon color={'lime'} variant="filled" size="md" mr="2px" loading>
                                <Check />
                            </ActionIcon>
                        </>
                    )}
                </>
            );
        },
        [auth, editFieldName, setEditFieldName, updateFetch, isLoading, theme.primaryColor]
    );

    const createTextInput = useCallback(
        (fieldName: FieldNameType, fieldValue: string, setFieldValue: (value: string) => any) => {
            const config = {
                placeholder: `Your ${fieldName}`,
                value: fieldValue,
                rightSection: editButton(fieldName, fieldValue, setFieldValue),
                rightSectionWidth: editFieldName === fieldName && !isLoading ? 67 : 40,
                disabled: (editFieldName !== fieldName && !isLoading) || isLoading,
                onChange: (event: ChangeEvent<HTMLInputElement>) => setFieldValue(event.currentTarget.value),
                mt: 'sm',
                required: true,
            };

            if (fieldName === 'email') {
                return <EmailInput {...config} />;
            } else {
                return <UsernameInput {...config} />;
            }
        },
        [editButton, updateFetch]
    );

    useEffect(() => {
        switch (editFieldName) {
            case 'email':
                return setValidInput(isValidEmail(email));
            case 'username':
                return setValidInput(isValidUsername(username));
        }
    }, [email, username]);

    return (
        <>
            {createTextInput('email', email, setEmail)}
            {createTextInput('username', username, setUsername)}
        </>
    );
}
