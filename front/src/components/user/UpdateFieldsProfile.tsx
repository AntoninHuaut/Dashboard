import { ActionIcon, TextInput, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Check, Edit, Mail, User, X } from 'tabler-icons-react';

import { useFetch } from '../../api/request';
import { updateRequest } from '../../api/user_request';
import { useAuth } from '../../hooks/useAuth';

type FieldNameType = 'email' | 'username';

export function UpdateFieldProfile() {
    const auth = useAuth();
    const theme = useMantineTheme();
    const updateFetch = useFetch();

    const [email, setEmail] = useState(auth.user.email);
    const [username, setUsername] = useState(auth.user.username);

    const [isLoading, setLoading] = useState(false);
    const [editFieldName, setEditFieldName] = useState<string>('');

    const editButton = useCallback(
        (fieldName: FieldNameType, fieldValue: string, setFieldValue: (value: string) => void) => {
            const validateChange = async () => {
                setLoading(true);
                await updateFetch.makeRequest(updateRequest(auth.user.id, { [fieldName]: fieldValue }));
                await auth.refreshUser();
                setLoading(false);
            };

            const cancelChange = () => {
                setFieldValue(auth.user[fieldName]);
                setEditFieldName('');
            };

            return (
                <>
                    {editFieldName !== fieldName && (
                        <ActionIcon color={theme.primaryColor} variant="filled" size="md" onClick={() => setEditFieldName(fieldName)} disabled={editFieldName.length > 0}>
                            <Edit />
                        </ActionIcon>
                    )}

                    {editFieldName === fieldName && !isLoading && (
                        <>
                            <ActionIcon color={'lime'} variant="filled" size="md" mr="2px" onClick={validateChange} disabled={isLoading}>
                                <Check />
                            </ActionIcon>
                            <ActionIcon color={'red'} variant="filled" size="md" onClick={cancelChange} disabled={isLoading}>
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
        (icon: JSX.Element, fieldName: FieldNameType, fieldValue: string, setFieldValue: (value: string) => any) => {
            return (
                <TextInput
                    icon={icon}
                    placeholder={`Your ${fieldName}`}
                    value={fieldValue}
                    rightSection={editButton(fieldName, fieldValue, setFieldValue)}
                    rightSectionWidth={editFieldName === fieldName && !isLoading ? 67 : 40}
                    disabled={(editFieldName !== fieldName && !isLoading) || isLoading}
                    onChange={(event) => setFieldValue(event.currentTarget.value)}
                    mt="sm"
                />
            );
        },
        [editButton, updateFetch]
    );

    useLayoutEffect(() => {
        if (updateFetch.cannotHandleResult()) return;

        if (updateFetch.error) {
            showNotification({
                message: 'An error occurred while updating your data',
                color: 'red',
            });
        } else {
            setEditFieldName('');
            showNotification({
                message: 'Your data has been updated',
                color: 'green',
            });
        }
    }, [isLoading]);

    return (
        <>
            {createTextInput(<Mail size={16} />, 'email', email, setEmail)}
            {createTextInput(<User size={16} />, 'username', username, setUsername)}
        </>
    );
}
