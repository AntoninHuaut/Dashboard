import { useRoutes } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { ProtectedLayout } from '../layouts/ProtectedLayout';
import { UnProtectedLayout } from '../layouts/UnProtectedLayout';
import { HomePage } from '../routes/app/HomePage';
import { LogoutPage } from '../routes/app/LogoutPage';
import { ProfilePage } from '../routes/app/ProfilePage';
import { IndexPage } from '../routes/IndexPage';
import { LoginPage } from '../routes/LoginPage';
import { PageNotFound } from '../routes/PageNotFound';

export function AppRouter() {
    const { isLoadingUser, loadingElement } = useAuth();
    const routes = useRoutes([{
        path: "/",
        element: <UnProtectedLayout />,
        children: [
            { path: "/", element: <IndexPage /> },
            { path: "/login", element: <LoginPage /> },
        ]
    }, {
        path: "/app",
        element: <ProtectedLayout />,
        children: [
            { path: "/app/home", element: <HomePage /> },
            { path: "/app/profile", element: <ProfilePage /> },
            { path: "/app/logout", element: <LogoutPage /> }
        ]
    }, {
        path: "*",
        element: <PageNotFound />
    }]);

    return isLoadingUser ? loadingElement() : routes;
}