import { useState, useEffect } from 'react';
import { IRequestParams } from '../api/request';

interface UseFetchParameter<T> {
    onError?: (servError: Error, statusCode: number) => any; // Error
    onSuccess?: (servData: T | null, statusCode: number) => any; // No error with optional data
    onAfterRequest?: (statusCode: number) => any; // Always called after request
}

export const useFetch = <T,>(params: UseFetchParameter<T>) => {
    const [data, setData] = useState<any>();
    const [error, setError] = useState<Error | null>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [abortController, setAbortController] = useState<AbortController>(new AbortController());
    const [statusCode, setStatusCode] = useState<number>(0);
    const [nbRequest, setNbRequest] = useState<number>(0);

    const abortRequest = () => abortController.abort();

    const cannotHandleResult = () => isLoading || nbRequest == 0;

    useEffect(() => () => abortRequest(), []);

    const makeRequest = async ({ url, options }: IRequestParams) => {
        const freshAbortController = new AbortController();
        setAbortController(freshAbortController);
        setLoading(true);
        setData(null);
        setError(null);

        try {
            const response = await fetch(url, { ...options, signal: freshAbortController.signal });
            setStatusCode(response.status);

            if (response.ok) {
                if (response.status !== 204) {
                    setData(await response.json());
                }
            } else {
                try {
                    const body = await response.json();
                    if (body && body.status === response.status && body.message) {
                        let message = body.message;
                        if (Array.isArray(body.message)) {
                            message = body.message.map((e: { message: string }) => e.message).join(', ');
                        }

                        setError(new Error(message));
                    } else {
                        throw new Error();
                    }
                } catch (err) {
                    throw new Error(response.statusText);
                }
            }
        } catch (error) {
            if (freshAbortController.signal.aborted) return;

            setError(error instanceof Error ? error : new Error(`${error}`));
        } finally {
            setNbRequest((v) => v + 1);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cannotHandleResult()) return;

        if (error && params.onError) {
            params.onError(error, statusCode);
        }

        if (params.onSuccess) {
            params.onSuccess(data, statusCode);
        }

        if (params.onAfterRequest) {
            params.onAfterRequest(statusCode);
        }
    }, [isLoading]);

    return { isLoading, nbRequest, makeRequest, abortRequest };
};
