import { useRoutes } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { ProtectedLayout } from '../../layouts/ProtectedLayout';
import { UnProtectedLayout } from '../../layouts/UnProtectedLayout';
import { HomePage } from '../../routes/app/HomePage';
import { LogoutPage } from '../../routes/app/LogoutPage';
import { ProfilePage } from '../../routes/app/ProfilePage';
import { TrackMailPage } from '../../routes/app/TrackMailPage';
import { IndexPage } from '../../routes/IndexPage';
import { PageNotFound } from '../../routes/PageNotFound';
import { ForgotPasswordPage } from '../../routes/unlogged/ForgotPasswordPage';
import { LoginPage } from '../../routes/unlogged/LoginPage';
import { RegisterPage } from '../../routes/unlogged/RegisterPage';
import { ResetPasswordPage } from '../../routes/unlogged/ResetPasswordPage';
import { VerifyPage } from '../../routes/unlogged/VerifyPage';

export function AppRouter() {
    const { isLoadingUser, loadingElement } = useAuth();
    const routes = useRoutes([
        {
            path: '/',
            element: <UnProtectedLayout />,
            children: [
                { path: '/', element: <IndexPage /> },
                { path: '/login', element: <LoginPage /> },
                { path: '/register', element: <RegisterPage /> },
                { path: '/forgotPassword', element: <ForgotPasswordPage /> },
                { path: '/resetPassword/:token', element: <ResetPasswordPage /> },
                { path: '/verify/:token', element: <VerifyPage /> },
            ],
        },
        {
            path: '/app',
            element: <ProtectedLayout />,
            children: [
                { path: '/app/home', element: <HomePage /> },
                { path: '/app/profile', element: <ProfilePage /> },
                { path: '/app/track-mail', element: <TrackMailPage /> },
                { path: '/app/logout', element: <LogoutPage /> },
            ],
        },
        {
            path: '*',
            element: <PageNotFound />,
        },
    ]);

    return isLoadingUser ? loadingElement() : routes;
}
