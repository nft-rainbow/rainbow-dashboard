
export function isPhone(phone: string) {
    phone = phone.replace('+', '');
    return phone && phone.length >= 11 && phone.length <= 14;
}