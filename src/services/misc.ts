import axios, { AxiosRequestConfig } from "axios";
import { authHeader, methodUrl, get } from ".";

export async function uploadFile(file: any) {
  const url = methodUrl('/dashboard/misc/upload');
  const formData = new FormData();
  formData.append('file', file);
  const axiosConfig = authHeader();
  const { data } = await axios.post(url, formData, axiosConfig as AxiosRequestConfig);
  return data;
}

export async function uploadFileKyc(file: any) {
    const url = methodUrl('/dashboard/misc/upload/kyc');
    const formData = new FormData();
    formData.append('file', file);
    const axiosConfig = authHeader();
    const { data } = await axios.post(url, formData, axiosConfig as AxiosRequestConfig);
    return data;
}

export async function cfxPrice(): Promise<number> {
    return (await get('/dashboard/misc/cfxPrice')).price;
}