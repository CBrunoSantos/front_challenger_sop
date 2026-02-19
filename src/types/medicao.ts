export type MedicaoStatus = "ABERTA" | "VALIDADA";

export interface Medicao {
    id: number;
    numero: string;
    dataMedicao: string;
    valorTotal: number;
    status: MedicaoStatus;
    observacao?: string;
    orcamentoId: number;
}

export interface ItemMedicao {
    id: number;
    medicaoId: number;
    itemId: number;
    quantidadeMedida: number;
    valorUnitarioAplicado: number;
    valorTotalMedido: number;
}
