"use client";

import { useEffect, useMemo, useState } from "react";
import type { Medicao } from "@/types/medicao";
import type { Item } from "@/types/item";
import {
    criarMedicao,
    listarMedicoesPorOrcamento,
    validarMedicao,
} from "@/services/medicao.service";
import MedicaoAbertaEditor from "@/components/MedicaoAbertaEditor";

type Props = {
    orcamentoId: number;
    itensOrcamento: Item[];
    isOrcamentoFinalizado: boolean;
};

export default function MedicoesSection({ orcamentoId, itensOrcamento, isOrcamentoFinalizado }: Props) {
    const [medicoes, setMedicoes] = useState<Medicao[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [numero, setNumero] = useState<string>("");
    const [dataMedicao, setDataMedicao] = useState<string>("");
    const [observacao, setObservacao] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isValidando, setIsValidando] = useState<boolean>(false);

    const load = async function () {
        try {
            setIsLoading(true);
            setError(null);
        const data = await listarMedicoesPorOrcamento(orcamentoId);
            setMedicoes(data);
        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar medições.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [orcamentoId]);

    const medicaoAberta = useMemo(() => {
        return medicoes.find((m) => m.status === "ABERTA");
    }, [medicoes]);

    const handleCriarMedicao = async function (e: React.SubmitEvent) {
        e.preventDefault();

        if (isOrcamentoFinalizado) {
            return setError("Não é permitido criar medição para orçamento FINALIZADO.");
        }
        if (medicaoAberta) {
            return setError("Já existe uma medição ABERTA para este orçamento.");
        }
        const numeroFinal = numero.trim();
        const dataFinal = dataMedicao.trim();
        if (!numeroFinal) {
            return setError("Informe o número da medição.");
        }
        if (!dataFinal) {
            return setError("Informe a data da medição (YYYY-MM-DD).");
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await criarMedicao({
                numero: numeroFinal,
                dataMedicao: dataFinal,
                orcamentoId,
                observacao: observacao.trim() ? observacao.trim() : undefined,
            });
            setNumero("");
            setDataMedicao("");
            setObservacao("");
            await load();
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message ?? "Erro ao criar item.");
            }
        }  finally {
            setIsSubmitting(false);
        }
    }

    const handleValidarMedicao = async function () {
        if (!medicaoAberta) { 
            return setError("Nenhuma medição aberta encontrada.");
        }
        try {
            setIsValidando(true);
            setError(null);
            await validarMedicao(medicaoAberta.id);
            await load();
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message ?? "Erro ao criar item.");
            }
        }  finally {
            setIsValidando(false);
        }
    }

    return (
        <section className="mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-medium text-gray-900">Medições</h2>
            </div>
            <div className="px-4 py-4">
                {isLoading ? (
                    <div className="text-sm text-gray-600">Carregando medições...</div>
                ) : null}

                {error ? (
                    <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-md border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Nova medição</h3>
                            {isOrcamentoFinalizado ? (
                                <span className="text-xs text-gray-500">Orçamento finalizado</span>
                            ) : medicaoAberta ? (
                                <span className="text-xs text-gray-500">Existe medição ABERTA</span>
                            ) : null}
                        </div>

                        <form className="mt-3 space-y-3" onSubmit={handleCriarMedicao}>
                            <div>
                                <label className="text-sm font-medium text-gray-900">Número</label>
                                <input value={numero} onChange={(e) => setNumero(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                                    disabled={isOrcamentoFinalizado || Boolean(medicaoAberta) || isSubmitting}/>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-900">Data (YYYY-MM-DD)</label>
                                <input type="data" value={dataMedicao} onChange={(e) => setDataMedicao(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                                    disabled={isOrcamentoFinalizado || Boolean(medicaoAberta) || isSubmitting}/>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-900">Observação</label>
                                <input value={observacao} onChange={(e) => setObservacao(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                                    disabled={isOrcamentoFinalizado || Boolean(medicaoAberta) || isSubmitting}/>
                            </div>

                            <button type="submit"
                                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                                disabled={isOrcamentoFinalizado || Boolean(medicaoAberta) || isSubmitting}>
                                {isSubmitting ? "Criando..." : "Criar medição"}
                            </button>
                        </form>
                    </div>
                    <div className="rounded-md border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Histórico</h3>
                            {medicaoAberta ? (
                                <button type="button" onClick={handleValidarMedicao} disabled={isValidando}
                                    className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60">
                                    {isValidando ? "Validando..." : "Validar medição aberta"}
                                </button>
                            ) : null}
                        </div>
                        {medicoes.length === 0 && !isLoading ? (
                            <div className="mt-3 text-sm text-gray-600">Nenhuma medição cadastrada.</div>
                        ) : null}
                        {medicoes.length > 0 ? (
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-xs font-semibold text-gray-600">
                                            <th className="px-3 py-2">Número</th>
                                            <th className="px-3 py-2">Data</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicoes.map((m) => (
                                        <tr key={m.id} className="border-t border-gray-200 text-sm">
                                            <td className="px-3 py-2 text-gray-900">{m.numero}</td>
                                            <td className="px-3 py-2 text-gray-700">{m.dataMedicao}</td>
                                            <td className="px-3 py-2">
                                            <span className={m.status === "ABERTA"
                                                    ? "inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                                                    : "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"}>
                                                {m.status}
                                            </span>
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {Number(m.valorTotal).toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>

                {medicaoAberta ? (
                    <MedicaoAbertaEditor
                        medicaoId={medicaoAberta.id}
                        itensOrcamento={itensOrcamento}
                        onChanged={load}
                    />
                ) : null}
            </div>
        </section>
    );
}
