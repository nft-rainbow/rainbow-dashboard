import { post } from './';
export type { NFT } from '../models/';

export async function reMintNFT(id: number) {
    return await post(`/dashboard/mints/${id}/reMint`);
}