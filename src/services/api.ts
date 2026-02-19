import axios, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Erro inesperado na requisição.";
        return Promise.reject(new Error(message));
    }
);