import { api } from "./api";
import type { Item } from "@/types/item";

export interface CriarItemPayload {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    orcamentoId: number;
}

export async function listarItensPorOrcamento(orcamentoId: number): Promise<Item[]> {
    const { data } = await api.get<Item[]>(`/itens/orcamento/${orcamentoId}`);
    return data;
}

export async function criarItem(payload: CriarItemPayload): Promise<Item> {
    const { data } = await api.post<Item>("/itens", payload);
    return data;
}
