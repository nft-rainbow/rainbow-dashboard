export interface NFT {
  id: number;
  chain_type: number;
  chain_id: number;
  token_id: number;
  contract: string;
  mint_to: string;
  created_at: string;
  updated_at: string;
  hash: string;
  status: number;
}