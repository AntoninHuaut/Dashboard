import { showNotification } from '@mantine/notifications';

interface NotifParams {
    title?: string;
    message: string;
}

export function errorNoDataFetchNotif() {
    errorNotif({ message: 'Unable to retrieve server response' });
}

export function errorNotif({ title = 'An error occurred', message }: NotifParams) {
    genericNotif({
        title: title,
        message: message,
        color: 'red',
    });
}

export function successNotif({ title, message }: NotifParams) {
    const autoClose = 3000;

    genericNotif({
        title: title,
        message: message,
        color: 'green',
        autoClose: autoClose,
    });

    return autoClose;
}

export function genericNotif({ title, message, color, autoClose }: NotifParams & { autoClose?: number; color: string }) {
    showNotification({
        title: title,
        message: message,
        color: color,
        autoClose: autoClose,
    });
}
