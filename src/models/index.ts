export interface BaseModel {
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

export interface ChainAccount extends BaseModel {
  id: number;
  chain_type: number;
  chain_id: number;
  app_id: number;
  address: string;
  public_key: string;
  private_key: string;
}

export interface App extends BaseModel {
  name: string;
  intro: string;
  app_id: string;
  app_secret?: string;
  chain_type: number;
}

export interface SponsorInfo {
    collateral_sponsor: string;
    collateral_sponsor_balance: string;
    gas_sponsor: string;
    gas_sponsor_balance: string;
    gas_upper_bound: string;
    is_all_white_listed: boolean;
}

export interface MintCountByMonth {
    count: number;
    month: string;
}

export interface Metadata extends BaseModel {
    name: string;
    description: string;
    image: string;
    external_link: string;
    attributes: object[];
    metadata_id: string;
    uri: string;
    animation_url: string;
}

export interface NFT extends BaseModel {
    chain_type: number;
    chain_id: number;
    token_id: number;
    contract: string;
    mint_to: string;
    error: string;
    hash: string;
    status: number;
    token_uri: string;
  }