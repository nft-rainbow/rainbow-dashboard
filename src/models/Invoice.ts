import { BaseModel }  from './index';

export interface InvoiceInfo extends BaseModel {
    user_id: number;
    type: number;
    name: string;
    tax_no: string;
    bank: string;
    bank_no: string;
    address: string;
    phone: string;
    mail_address: string;
    mail_receiver: string;
    mail_phone: string;
    email: string;
    is_default: boolean;
}

export interface Invoice extends BaseModel {
    type: number;
    amount: number;
    info_id: number;
    user_id: number;
    comment: string;
    download_url: string;
    status: number;
    completed_time: Date;
    name?: string;
}