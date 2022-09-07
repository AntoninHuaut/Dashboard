import { useMediaQuery } from '@mantine/hooks';

import { IMail } from '../types/TrackMailType';

export function useMailFormatter(displayFullIfLarge: boolean) {
    const displayReduceDataCutted = useMediaQuery('(min-width: 1500px)');

    const cutSize = displayReduceDataCutted ? (displayFullIfLarge ? Number.MAX_VALUE : 29) : 21;
    const cutSizeExtend = cutSize + 8;

    const formatEmail = (mail: IMail) => {
        const subject = mail.subject.substring(0, cutSize) + (mail.subject.length > cutSize ? '...' : '');
        const emailFrom = mail.email_from.substring(0, cutSizeExtend) + (mail.email_from.length > cutSizeExtend ? '...' : '');

        const emailToStr = mail.email_to.join(', ');
        const emailTo = emailToStr.substring(0, cutSizeExtend) + (emailToStr.length > cutSizeExtend ? '...' : '');

        return { subject, emailFrom, emailTo };
    };

    return { formatEmail };
}
