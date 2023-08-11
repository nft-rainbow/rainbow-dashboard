import axios, { AxiosRequestConfig } from "axios";
import { authHeader, methodUrl, get } from ".";

export async function uploadFile(file: any) {
  const url = methodUrl('/dashboard/misc/upload');
  const formData = new FormData();
  formData.append('file', file);
  const headers = await authHeader();
  const { data } = await axios.post(url, formData, { headers } as AxiosRequestConfig);
  return data;
}

export async function uploadFileKyc(file: any) {
    const url = methodUrl('/dashboard/misc/upload/kyc');
    const formData = new FormData();
    formData.append('file', file);
    const headers = await authHeader();
    const { data } = await axios.post(url, formData, { headers } as AxiosRequestConfig);
    return data;
}

export async function cfxPrice(): Promise<string> {
    return (await get('/dashboard/misc/cfxPrice')).price;
}