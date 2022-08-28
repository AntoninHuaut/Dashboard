export interface IPaginationDataResponse<T> {
    data: T[];
    pagination: IPagination;
}

export interface IPagination {
    numberPerPage: number;
    offset: number;
    page: number;
    total: number;
}

export interface IPaginationDataRef {
    refreshData: () => void;
}
