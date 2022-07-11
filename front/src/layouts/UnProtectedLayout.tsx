import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { AppLayout } from './AppLayout';

export function UnProtectedLayout() {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/app/home" />;
    }

    return <AppLayout showNavbar={false} />;
}
