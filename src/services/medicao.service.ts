import { api } from "./api";
import type { Medicao, ItemMedicao } from "@/types/medicao";

export interface CriarMedicaoPayload {
    numero: string;
    dataMedicao: string;
    orcamentoId: number;
    observacao?: string;
}

export async function listarMedicoesPorOrcamento(orcamentoId: number): Promise<Medicao[]> {
    const { data } = await api.get<Medicao[]>(`/medicoes/orcamento/${orcamentoId}`);
    return data;
}

export async function criarMedicao(payload: CriarMedicaoPayload): Promise<Medicao> {
    const { data } = await api.post<Medicao>("/medicoes", payload);
    return data;
}

export interface UpsertItemMedicaoPayload {
    itemId: number;
    quantidadeMedida: number;
}

export async function adicionarOuAtualizarItemMedicao(medicaoId: number,payload: UpsertItemMedicaoPayload): Promise<ItemMedicao> {
    const { data } = await api.post<ItemMedicao>(`/medicoes/${medicaoId}/itens`, payload);
    return data;
}

export async function validarMedicao(medicaoId: number): Promise<Medicao> {
    const { data } = await api.post<Medicao>(`/medicoes/${medicaoId}/validar`);
    return data;
}

export async function listarItensDaMedicao(medicaoId: number): Promise<ItemMedicao[]> {
    const { data } = await api.get<ItemMedicao[]>(`/medicoes/${medicaoId}/itens`);
    return data;
}
