import { api } from "./api";
import type { Item } from "@/types/item";

export interface CriarItemPayload {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    orcamentoId: number;
}

export interface AtualizarItemPayload {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
}

export async function listarItensPorOrcamento(orcamentoId: number): Promise<Item[]> {
    const { data } = await api.get<Item[]>(`/itens/orcamento/${orcamentoId}`);
    return data;
}

export async function criarItem(payload: CriarItemPayload): Promise<Item> {
    const { data } = await api.post<Item>("/itens", payload);
    return data;
}

export async function atualizarItem(itemId: number, payload: AtualizarItemPayload): Promise<Item> {
    const { data } = await api.put<Item>(`/itens/${itemId}`, payload);
    return data;
}
