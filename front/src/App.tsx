import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from './components/layout/AppRouter';
import { AuthProvider } from './hooks/useAuth';

import './App.css';

function App() {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'color-scheme',
        defaultValue: preferredColorScheme,
    });
    const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value ?? (colorScheme === 'dark' ? 'light' : 'dark'));

    useHotkeys([['mod+J', () => toggleColorScheme()]]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme,
                    primaryColor: 'indigo',
                    defaultRadius: 'lg',
                }}>
                <ModalsProvider>
                    <NotificationsProvider position="top-center" transitionDuration={500} autoClose={7500}>
                        <BrowserRouter>
                            <AuthProvider>
                                <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_CLIENT_SECRET}>
                                    <AppRouter />
                                </GoogleReCaptchaProvider>
                            </AuthProvider>
                        </BrowserRouter>
                    </NotificationsProvider>
                </ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
