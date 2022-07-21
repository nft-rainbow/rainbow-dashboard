import axios, { AxiosRequestConfig } from "axios";
import { authHeader, methodUrl } from ".";

export async function uploadFile(file: any) {
  const url = methodUrl('/dashboard/misc/upload');
  const formData = new FormData();
  formData.append('file', file);
  const axiosConfig = authHeader();
  const { data } = await axios.post(url, formData, axiosConfig as AxiosRequestConfig);
  return data;
}