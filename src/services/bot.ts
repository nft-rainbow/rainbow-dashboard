import { get, post } from '.';

// bot 1-discord 2-dodo
export async function getBotEvents(bot = '2', page: number, limit: number) {
    return get(`/apps/botserver`, {
        social_tool: bot || '2',
        page,
        limit,
    });
}

export async function getDodoServers(bot = '2') {
    return get(`/apps/botserver`, {
        social_tool: bot
    });
}

export async function getDodoChannels(server_id: string, bot = '2') {
    return get(`/apps/botserver/channels`, {
        server_id,
        social_tool: bot
    });
}

export async function getDoDoRoles(server_id: string, bot = '2') {
    return get(`/apps/botserver/roles`, {
        server_id,
        social_tool: bot
    });
}

/**
{
    "activity_id": 1,
    "channel_id": "1",
    "roles": "1",
    "content": "content",
    "color_theme": "red"
}
*/
export async function createBotEvents(meta: object) {
    return post('/apps/botserver/push', meta);
}

export async function getDodoAuthCode(server_id: string, bot: string) {
    return post('/apps/botserver/authcode', {
        server_id,
        social_tool: bot,
    });
}

export async function bindDodoServer(server_id: string, auth_code: string, social_tool: string) {
    return post('/apps/botserver', {
        server_id,
        auth_code,
        social_tool,
    });
}