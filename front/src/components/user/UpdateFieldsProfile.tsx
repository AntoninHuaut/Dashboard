import { ActionIcon, TextInput, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useCallback, useEffect, useState } from 'react';
import { Check, Edit, Mail, User, X } from 'tabler-icons-react';

import { useFetch } from '../../api/request';
import { updateRequest } from '../../api/user_request';
import { useAuth } from '../../hooks/useAuth';

type FieldNameType = 'email' | 'username';

export function UpdateFieldProfile() {
    const { user } = useAuth();
    const theme = useMantineTheme();
    const updateFetch = useFetch();

    const [email, setEmail] = useState(user.email);
    const [username, setUsername] = useState(user.username);

    const [editField, setEditField] = useState<string>('');

    const editButton = useCallback(
        (fieldName: FieldNameType, fieldValue: string, setFieldValue: (value: string) => any) => {
            const validateChange = () => updateFetch.makeRequest(updateRequest(user.id, { [fieldName]: fieldValue }));

            const cancelChange = () => {
                setFieldValue(user[fieldName]);
                setEditField('');
            };

            return (
                <>
                    {editField !== fieldName && (
                        <ActionIcon color={theme.primaryColor} variant="filled" size="md" onClick={() => setEditField(fieldName)} disabled={editField.length > 0}>
                            <Edit />
                        </ActionIcon>
                    )}

                    {editField === fieldName && !updateFetch.isLoading && (
                        <>
                            <ActionIcon color={'lime'} variant="filled" size="md" mr="2px" onClick={validateChange} disabled={updateFetch.isLoading}>
                                <Check />
                            </ActionIcon>
                            <ActionIcon color={'red'} variant="filled" size="md" onClick={cancelChange} disabled={updateFetch.isLoading}>
                                <X />
                            </ActionIcon>
                        </>
                    )}

                    {editField === fieldName && updateFetch.isLoading && (
                        <>
                            <ActionIcon color={'lime'} variant="filled" size="md" mr="2px" loading>
                                <Check />
                            </ActionIcon>
                        </>
                    )}
                </>
            );
        },
        [user.id, editField, setEditField, updateFetch, theme.primaryColor]
    );

    const createTextInput = useCallback(
        (icon: JSX.Element, fieldName: FieldNameType, fieldValue: string, setFieldValue: (value: string) => any) => {
            return (
                <TextInput
                    icon={icon}
                    placeholder={`Your ${fieldName}`}
                    value={fieldValue}
                    rightSection={editButton(fieldName, fieldValue, setFieldValue)}
                    rightSectionWidth={editField === fieldName && !updateFetch.isLoading ? 67 : 40}
                    disabled={(editField !== fieldName && !updateFetch.isLoading) || updateFetch.isLoading}
                    onChange={(event) => setFieldValue(event.currentTarget.value)}
                    mt="sm"
                />
            );
        },
        [editButton, updateFetch]
    );

    useEffect(() => {
        if (updateFetch.cannotHandleResult()) return;

        if (updateFetch.data) {
            setEditField('');
            showNotification({
                message: 'Your data has been updated',
                color: 'green',
            });
        }

        if (updateFetch.error) {
            showNotification({
                message: 'An error occurred while updating your data',
                color: 'red',
            });
        }
    }, [updateFetch.isLoading]);

    return (
        <>
            {createTextInput(<Mail size={16} />, 'email', email, setEmail)}
            {createTextInput(<User size={16} />, 'username', username, setUsername)}
        </>
    );
}
