import {get, post, put} from './index';

// 发票信息接口
export function getInvoiceInfoList(page: number, limit: number) {
    return get('/dashboard/users/invoices/info', {page, limit});
}

export function getInvoiceInfoDefault() {
    return get('/dashboard/users/invoices/info/default');
}

export function getInvoiceInfoDetail(id: number) {
    return get(`/dashboard/users/invoices/info/${id}`);
}

export function createInvoiceInfo(data: any) {
    return post(`/dashboard/users/invoices/info`, data);
}

export function updateInvoiceInfo(id: number, data: any) {
    return put(`/dashboard/users/invoices/info/${id}`, data);
}

// 发票接口
export function getInvoiceList(page: number, limit: number) {
    return get('/dashboard/users/invoices', {page, limit});
}

export function getInvoiceDetail(id: number) {
    return get(`/dashboard/users/invoices/${id}`);
}

export function createInvoice(data: object) {
    return post(`/dashboard/users/invoices`, data);
}

export function updateInvoice(id: number, data: object) {
    return put(`/dashboard/users/invoices/${id}`, data);
}

export function getInvoiceAvailableAmount() {
    return get(`/dashboard/users/invoices/availableAmount`);
}

export function getInvoiceAvailableFiatLogs(page: number, limit = 10) {
    return get(`/dashboard/users/invoices/availableFiatLogs`, {page, limit});
}



