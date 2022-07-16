import { useCallback, useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { CaptchaAction } from '../types/CaptchaType';

export function useCaptcha(action: CaptchaAction, onSubmit: (captcha: string) => unknown) {
    const [captcha, setCaptcha] = useState('');
    const [isSubmit, setSubmit] = useState(false);

    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleReCaptchaVerify = useCallback(async () => {
        if (!executeRecaptcha) return;
        const captchaToken = await executeRecaptcha(action);
        setCaptcha(captchaToken);
    }, [executeRecaptcha]);

    useEffect(() => {
        if (!captcha || !isSubmit) return;

        onSubmit(captcha);
    }, [captcha, isSubmit]);

    useEffect(() => {
        if (!isSubmit) setCaptcha('');
        else handleReCaptchaVerify();
    }, [isSubmit]);

    return setSubmit;
}
