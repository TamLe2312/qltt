import axios, { AxiosRequestConfig } from 'axios';

// Hàm tiện ích GET request
export const getApi = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await axios.get<T>(url, {
            headers: {
                'Cache-Control': 'no-cache', // tránh 304 Not Modified
            },
            ...config, // cho phép override config nếu cần
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Hàm tiện ích POST request
export const postApi = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> => {
    try {
        const response = await axios.post<T>(url, data, {
            headers: {
                "Content-Type": "application/json",
                ...config?.headers,
            },
            ...config,
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

export const deleteApi = async (url: string) => {
    const response = await fetch(url, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete");
    }
    return response.json();
};
