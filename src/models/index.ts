interface BaseModel {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}
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

export interface Contract extends BaseModel {
    chain_type: number;
    chain_id: number;
    address: string;
    hash: string;
    name: string;
    symbol: string;
    type: number;
    owner_address: string;
    base_uri: string;
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

export interface ChainAccount {
  id: number;
  chain_type: number;
  chain_id: number;
  app_id: number;
  address: string;
  public_key: string;
}

export interface App extends BaseModel {
  name: string;
  intro: string;
  app_id: string;
  app_secret?: string;
  chain_type: number;
}