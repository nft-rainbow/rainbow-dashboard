
export function isPhone(phone: string) {
    if (!phone || typeof phone !== 'string') return false;
    phone = phone.replace('+', '');
    return phone && phone.length >= 11 && phone.length <= 14;
}