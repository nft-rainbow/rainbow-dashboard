import { BaseModel } from ".";

export interface User {
    id: number;
    email: string;
    name: string;
    phone: string;
    id_name: string;
    id_no: string;
    id_image: string;
    status: number;
    kyc_msg?: string;
}
  
export interface UserBalance {
    user_id: number;
    balance: number;
}
  
export interface FiatLog extends BaseModel {
    user_id: number;
    amount: number;
    type: number;
    meta: any;
    order_no: string;
    balance: number;
}
  
export interface Company {
    id: number;
    name: string;
    company_no: string;
    company_id_img: string;
    phone: string;
    legal_person_name: string;
    legal_person_id_no: string;
    company_range: string;
    user_id: number;
    status: number;
    kyc_msg?: string;
}

export interface MintCountByMonth {
    count: number;
    month: string;
}