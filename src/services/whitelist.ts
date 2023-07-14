import { post, get, del } from '.';

/**
 * name_like, certificate_type
 */
export function getCertificates(page: number, limit: number, query?: object) {
    return get('/apps/certis/strategy/list', Object.assign({page, limit}, query));
}

export function getCertificateDetail(id: number, page: number, limit: number) {
    return get(`/apps/certis/strategy/${id}/certificates`, {page, limit});
}

/* export function updateCertificateDetail(id: number, data: object) {
    return post(`/apps/certis/strategy/${id}/certificates`, data);
} */

/**
 name
 description
 items: []
 */
// type: address, contract, dodo, gasless, phone
export function createCertificate(type: string, data: object) {
    return post(`/apps/certis/strategy/type/${type}`, data);
}

export function deleteCertificateItems(id: number, items: number[]) {
    return del(`/apps/certis/strategy/${id}/certificates`, items);
}

export function addCertificateItems(id: number, items: any[]) {
    return post(`/apps/certis/strategy/${id}/certificates`, items);
}