import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export const UnProtectedLayout = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/app/home" />;
    }

    return (
        <Outlet />
    )
};