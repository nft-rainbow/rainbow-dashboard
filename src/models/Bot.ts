import { BaseModel } from ".";

export interface BotServer extends BaseModel {
    owner_social_id: string;
    push_infos: any[];
    rainbow_user_id: number;
    raw_server_id: string;
    server_name: string;
    social_tool: number;
}

// [green,indigo,purple,grey,red,orange,yellow,blue,black,default

export interface BotEvent extends BaseModel {
    activity_id: string;
    activity_type: string;
    name: string;
    chain_id: number;
    chain_type: number;
    channel_id: string;
    contract_address: string;
    contract_id: string;
    type: number;
    server_id: string;
    server_name: string;
    social_tool: string;
    start_time: number;
    end_time: number;
    last_push_time: number;
    owner_social_id: string;
    push_info_id: number;
    rainbow_user_id: number;
    raw_server_id: string;
}

export interface BotChannel {
    channelId: string;
    channelName: string;
}

export interface BotRoles {
    roleId: string;
    roleName: string;
}