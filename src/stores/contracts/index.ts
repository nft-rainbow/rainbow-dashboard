import { create } from 'zustand';

interface contract{
    "address": string,
      "app_id": number,
      "base_uri": string,
      "chain_id": number,
      "chain_type": number,
      "created_at": string,
      "updated_at": string,
      "deleted_at": string,
      "hash": string,
      "id": number,
      "name": string,
      "type": number,
      "owner_address": string,
      "royalties_address": string,
      "status": number,
      "symbol": string,
      "tokens_burnable": true,
      "tokens_transferable_by_admin": true,
      "tokens_transferable_by_user": true,
      "transfer_cooldown_time": number,
      "tx_id": number
}

export const useContractsStore = create<{contracts:Array<contract>|never[]}>(() => ({
  contracts:[],
}));
