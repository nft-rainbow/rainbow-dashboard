import { get, post } from '.';

// bot 1-discord 2-dodo
export async function getBotEvents(bot: string, page: number, limit: number) {
    return get(`/apps/poap/activity/push/${bot}?page=${page}&limit=${limit}`);
}

export async function getDodoServers(bot: string) {
    return get(`/apps/poap/activity/servers/${bot}`);
}

export async function getDodoChannels(server_id: string) {
    return get(`/apps/poap/activity/channels/dodo/${server_id}`);
}

export async function getDoDoRoles(server_id: string) {
    return get(`/apps/poap/activity/roles/dodo/${server_id}`);
}

export async function createBotEvents(meta: object) {
    return post('/apps/poap/activity/push', meta);
}

export async function requestBotValidateCode(server_id: string) {
    return post('/apps/poap/activity/validate', { server_id });
}