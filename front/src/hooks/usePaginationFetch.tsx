import { Ref, useEffect, useImperativeHandle, useState } from 'react';

import { IRequestParams } from '../api/request';
import { errorNoDataFetchNotif, errorNotif } from '../services/notification.services';
import { IPagination, IPaginationDataRef, IPaginationDataResponse } from '../types/PaginationData';
import { useFetch } from './useFetch';

interface UseFetchParameter {
    token: string;
    dataRequest: (targetPage: number, token: string) => IRequestParams;
    ref: Ref<IPaginationDataRef>;
}

export const usePaginationFetch = <T,>({ token, dataRequest, ref }: UseFetchParameter) => {
    const [targetPage, setTargetPage] = useState(0);
    const [paginationData, setPaginationData] = useState<IPagination>({
        numberPerPage: 0,
        offset: 0,
        page: 0,
        total: 0,
    });
    const [data, setData] = useState<T[]>([]);
    const dataFetch = useFetch<IPaginationDataResponse<T>>({
        onError(err) {
            errorNotif({ title: 'Failed to get data', message: err.message });
        },
        onSuccess(servData) {
            if (!servData) return errorNoDataFetchNotif();

            setData(servData.data);
            setPaginationData(servData.pagination);
        },
    });

    const refreshData = () => dataFetch.makeRequest(dataRequest(targetPage, token));

    useEffect(() => {
        refreshData();
    }, [targetPage]);

    useImperativeHandle(ref, () => ({ refreshData }));

    return { data, dataFetch, paginationData, setTargetPage };
};
