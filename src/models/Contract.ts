import { BaseModel } from ".";

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

export interface SponsorInfo {
    collateral_sponsor: string;
    collateral_sponsor_balance: string;
    gas_sponsor: string;
    gas_sponsor_balance: string;
    gas_upper_bound: string;
    is_all_white_listed: boolean;
}

export interface AutoSponsorContract extends BaseModel {
    address: string;
    user_id: number;
    auto_sponsor: boolean;
    storage_recharge_threshold: number;
    storage_recharge_amount: number;
}