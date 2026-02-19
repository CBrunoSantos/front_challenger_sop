export type OrcamentoStatus = "ABERTO" | "FINALIZADO";

export type OrcamentoTipo = "OBRA_EDIFICACAO" | "OBRA_RODOVIAS" | "OUTROS";

export interface Orcamento {
    id: number;
    numeroProtocolo: string;
    tipo: OrcamentoTipo;
    valorTotal: number;
    dataCriacao: string;
    status: OrcamentoStatus;
}