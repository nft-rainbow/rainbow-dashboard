import { get, post, put } from '.';

// social_tool: dodo, discord

export function getBotInviteUrl(social_tool: string) {
    return get(`/apps/bot/invite_url?social_tool=${social_tool}`);
}

export function getBotServers(social_tool: string, page?: number, limit?: number) {
    return get(`/apps/bot/server`, {
        social_tool,
        page,
        limit,
    });
}

export function bindBotServers(meta: {auth_code: string, server_id: string, social_tool: string; outdated_server_id: string}) {
    return post(`/apps/bot/server`, meta);
}

export function getBotActivities(filter: {social_tool: string, page?: number, limit?: number, activity_name?: string, contract_address?: string}) {
    return get(`/apps/bot/server/activities`, filter);
}

export function getBotAuthCode(server_id: string, social_tool: string) {
    return get(`/apps/bot/server/authcode`, {
        server_id,
        social_tool
    });
}

export function getServerChannels(server_id: string, social_tool: string) {
    return get(`/apps/bot/server/channels`, {
        server_id,
        social_tool
    })
}

export function getServerRoles(server_id: string, social_tool: string) {
    return get(`/apps/bot/server/roles`, {
        server_id,
        social_tool
    })
}

export function pushBotActivity(id: string, channel: string) {
    let url = `/apps/bot/server/push/${id}`;
    if (channel) url += `?channel=${channel}`;
    return post(url);
}

export function updateBotPushInfo(id: string, meta: object) {
    return put(`/apps/bot/server/pushinfo/${id}`, meta)
}

export function getServerDetail(id: string) {
    return get(`/apps/bot/server/${id}`);
}

export function createPushInfo(id: string, pushInfo: object) {
    return post(`/apps/bot/server/${id}/pushinfo`, pushInfo)
}
