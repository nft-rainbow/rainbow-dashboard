import { BaseModel } from './index';

export interface Certificate extends BaseModel {
    name: string;
    description: string;
    user_id: number;
    certificate_type: string;
    items: CertificateItem[];
}

export interface CertificateItem extends BaseModel {
    id: number; 
    address?: string;
    phone?: string;
}