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
    status?:number;
    error?:string;
    app_id?:string;
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
  app_id: string;
  address: string;
  public_key: string;
  private_key: string;
}

export interface App extends BaseModel {
  chain_id: any;
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

export interface ActivityItem {
  id: number;
  name: string;
  max_mint_count?: number;
  description: string;
  activity_id?: string;
  app_name: string;
  app_id: number;
  activity_picture_url: string;
  activity_poster_url: string;
  amount: number;
  contract?: {
    chain_id: number;
    chain_type: number;
    contract_address: number;
    contract_type: number;
    id: number;
  },
  contract_id?: number;
  chain_type: number;
  command?: string;
  activity_name: string;
  activity_type: number;
  start_time: string;
  end_time?: number;
  created_at: string;
  white_list_infos?: [
    {
      count: number;
      user: string;
    }
  ];
}

export interface SearchParams {
  activity_id?: string;
  contract_address?: string;
  name?: string;
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

export interface Character {
  characterName: string;
  type: 'text' | 'date';
  value: string | number;
}

export interface AssetItem {
  key: string;
  characters?: Character[];
  image_url?: string;
  name: string;
}

export interface BotEvent extends BaseModel {
    event_id: string;
    type: number;
    server_id: string;
    server_name: string;
    event_name: string;
    chain: number;
    contract: string;
    start_time: string;
    end_time: string;
    push_time: string;
}

export interface AutoSponsorContract extends BaseModel {
    address: string;
    user_id: number;
    auto_sponsor: boolean;
    storage_recharge_threshold: number;
    storage_recharge_amount: number;
}
