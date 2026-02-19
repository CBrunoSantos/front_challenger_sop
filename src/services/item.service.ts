import { api } from "./api";
import type { Item } from "@/types/item";

export async function listarItensPorOrcamento(orcamentoId: number): Promise<Item[]> {
    const { data } = await api.get<Item[]>(`/itens/orcamento/${orcamentoId}`);
    return data;
}
