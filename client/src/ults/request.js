import axios from "axios";
import { handleToast } from "../hooks/toast";

const baseURL = process.env.REACT_APP_BASE_URL;

const request = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      handleToast("error", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      setTimeout(() => {
        window.location.href = `login`;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export const get = async (path, options = {}) => {
  const response = await request.get(path, options);
  return response.data;
};

export const post = async (path, data, options = {}) => {
  const response = await request.post(path, data, options);
  return response.data;
};

export const put = async (path, data, options = {}) => {
  const response = await request.put(path, data, options);
  return response.data;
};

export const patch = async (path, data, options = {}) => {
  const response = await request.patch(path, data, options);
  return response.data;
};

export const del = async (path, options = {}) => {
  const response = await request.delete(path, options);
  return response.data;
};

export default request;
