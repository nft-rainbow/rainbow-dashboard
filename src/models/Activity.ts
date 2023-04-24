// activity_type enum: blind_box, single

export interface ActivityItem {
    id: number;
    name: string;
    description: string;
    max_mint_count?: number;
    activity_id?: string;
    app_name: string;
    app_id: number;
    activity_picture_url: string;
    activity_poster_url: string;
    amount: number;
    contract?: {
      chain_id: number;
      chain_type: number;
      contract_address: string;
      contract_type: number;
      id: number;
    },
    contract_id?: number;
    // chain_type: number;
    command?: string;
    // activity_name: string;
    activity_type: string;
    start_time: number;
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