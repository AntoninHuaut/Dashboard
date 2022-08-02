import { Center, Loader, Stack } from '@mantine/core';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useFetch } from '../hooks/useFetch';
import { logoutRequest, refreshRequest, sessionRequest } from '../api/auth_request';
import { IUser } from '../types/LoginType';

const AuthContext = createContext<any>(null);

export interface MemoType {
    user: IUser;
    login: (user: IUser) => Promise<void>;
    logout: () => any;
    isLoadingUser: boolean;
    refreshUser: () => Promise<void>;
    loadingElement: () => JSX.Element;
}

export const AuthProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
    const [user, setUser] = useState<IUser>();
    const [isLoadingUser, setLoadingUser] = useState<boolean>(true);
    const userFetch = useFetch({
        onAfterRequest() {
            setLoadingUser(false);
        },
        onData(data) {
            setUser(data);
        },
    });

    const login = async (user: IUser) => setUser(user);

    const logout = () => {
        userFetch.makeRequest(logoutRequest()).finally(() => setUser(null as unknown as IUser));
    };

    const loadingElement = () => (
        <Center style={{ height: '75vh' }}>
            <Stack>
                <Loader size={192} variant="dots" />
            </Stack>
        </Center>
    );

    const fetchUser = () => userFetch.makeRequest(sessionRequest());

    const refreshUser = async () => {
        await userFetch.makeRequest(refreshRequest());
        await fetchUser();
    };

    const value = useMemo(
        (): MemoType => ({
            user: user as IUser,
            login,
            logout,
            isLoadingUser,
            refreshUser,
            loadingElement,
        }),
        [user, isLoadingUser]
    );

    useEffect(() => {
        const fetchUser = () => userFetch.makeRequest(sessionRequest());

        fetchUser();
    }, []);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): MemoType => {
    return useContext(AuthContext);
};
