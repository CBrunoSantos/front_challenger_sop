import { Orcamento, OrcamentoTipo } from "@/types/orcamento";
import { api } from "./api";

export async function listarOrcamentos(): Promise<Orcamento[]>{
    const {data} = await api.get<Orcamento[]>("orcamentos/listar");
    return data;
}

export interface CriarOrcamentoPayload {
    numeroProtocolo: string;
    tipo: OrcamentoTipo;
    valorTotal: number;
}

export async function criarOrcamento(payload: CriarOrcamentoPayload): Promise<Orcamento>{
    const {data} = await api.post<Orcamento>("/orcamentos", payload);
    return data;
}

export async function buscarOrcamentoPorId(id: number): Promise<Orcamento> {
    const { data } = await api.get<Orcamento>(`/orcamentos/${id}`);
    return data;
}

export async function finalizarOrcamento(id: number): Promise<Orcamento> {
    const { data } = await api.post<Orcamento>(`/orcamentos/${id}/finalizar`);
    return data;
}