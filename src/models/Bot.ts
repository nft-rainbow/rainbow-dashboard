import { BaseModel } from ".";

export interface BotServer extends BaseModel {
    owner_social_id: string;
    push_infos: any[];
    rainbow_user_id: number;
    raw_server_id: string;
    server_name: string;
    social_tool: number;
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

export interface BotChannel {
    channelId: string;
    channelName: string;
}

export interface BotRoles {
    roleId: string;
    roleName: string;
}