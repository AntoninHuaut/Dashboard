import { Center, Loader, Stack } from '@mantine/core';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useFetch } from '../api/request';
import { logoutRequest, sessionRequest } from '../api/auth_request';
import { IUser } from '../types/LoginType';

const AuthContext = createContext<any>(null);

export interface MemoType {
    user: IUser;
    login: (user: IUser) => Promise<void>;
    logout: () => any;
    isLoadingUser: boolean;
    loadingElement: () => JSX.Element;
}

export const AuthProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
    const [user, setUser] = useState<IUser>();
    const [isLoadingUser, setLoadingUser] = useState<boolean>(true);
    const userFetch = useFetch();

    const login = async (user: IUser) => setUser(user);

    const logout = () => {
        userFetch.makeRequest(logoutRequest()).finally(() => setUser(null as unknown as IUser));
    };

    const loadingElement = () => (
        <Center style={{ height: '75vh' }}>
            <Stack>
                <Loader size={192} variant="dots" />
                {/* <Text weight={500} size="xl" align="center">Session recovery...</Text> */}
            </Stack>
        </Center>
    );

    const value = useMemo(
        (): MemoType => ({
            user: user as IUser,
            login,
            logout,
            isLoadingUser,
            loadingElement,
        }),
        [user, isLoadingUser]
    );

    useEffect(() => {
        const fetchUser = () => userFetch.makeRequest(sessionRequest());

        fetchUser();
    }, []);

    useEffect(() => {
        if (userFetch.cannotHandleResult()) return;

        setLoadingUser(false);

        if (userFetch.data) {
            setUser(userFetch.data);
        }
    }, [userFetch.isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): MemoType => {
    return useContext(AuthContext);
};
