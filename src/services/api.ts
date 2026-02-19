import axios, { AxiosError } from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080/",
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