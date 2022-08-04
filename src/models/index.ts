
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