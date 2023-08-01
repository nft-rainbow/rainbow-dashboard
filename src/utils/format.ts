
export function isPhone(phone: string) {
    if (!phone || typeof phone !== 'string') return false;
    phone = phone.replace('+', '');
    return phone && phone.length >= 11 && phone.length <= 14;
}

export function trimSpace(str: string) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\s/g, '');
}