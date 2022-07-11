import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { AppLayout } from './AppLayout';

export function ProtectedLayout() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    return <AppLayout showNavbar={true} />;
}
