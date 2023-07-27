export * from './Bot';
export * from './Contract';
export * from './User';
export * from './Activity';
export * from './Whitelist';

export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
