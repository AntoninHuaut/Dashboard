import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = <T,>({ children }: { children: T }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
};