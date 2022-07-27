import { get, post, put } from '.';

export interface App {
  id: number;
  name: string;
  intro: string;
  app_id: string;
  app_secret?: string;
  chain_type: number;
  created_at: string;
  updated_at: string;
}

export interface File {
  file_name: string;
  file_size: number;
  file_url: string;
  file_type: string;
}

export interface MetadataInfo {
  name: string;
  description: string;
  file: string;
}

export interface Metadata {
  metadata: MetadataInfo;
  uri: string;
}

export async function getApps(page?: number, limit?: number) {
  return await get('/dashboard/apps', {page, limit});
}

export async function createApp(metadata: any) {
  return await post('/dashboard/apps', metadata);
}

export async function getAppDetail(id: number | string) {
  return await get(`/dashboard/apps/${id}`);
}

export async function updateApp(id: number | string, metadata: any) {
  return await put(`/dashboard/apps/${id}`, metadata);
}

export async function getAppFiles(id: number | string, page?: number, limit?: number) {
  return await get(`/dashboard/apps/${id}/files`, {page, limit});
}

export async function getAppMetadatas(id: number | string, page?: number, limit?: number) {
  return await get(`/dashboard/apps/${id}/metadata`, {page, limit});
}

export async function getAppContracts(id: number | string, page?: number, limit?: number) {
  return await get(`/dashboard/apps/${id}/contracts`, {page, limit});
}

export async function getAppNfts(id: number | string, page?: number, limit?: number) {
  return await get(`/dashboard/apps/${id}/nft`, {page, limit});
}

export async function getAppNftsOfContract(id: number | string, address: string, page?: number, limit?: number) {
  return await get(`/dashboard/apps/${id}/contracts/${address}/nft`, {page, limit});
}