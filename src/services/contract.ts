import { post } from '.';

export interface Contract {
  id: number;
  chain_type: number;
  chain_id: number;
  address: string;
  hash: string;
  name: string;
  symbol: string;
  type: number;
  owner_address: string;
  base_uri: string;
  created_at: string;
  updated_at: string;
}

export async function deployContract(id: number | string, meta: object) {
    return await post(`/dashboard/apps/${id}/contracts`, meta);   
}