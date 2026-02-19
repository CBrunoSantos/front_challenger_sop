"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Orcamento } from "@/types/orcamento";
import type { Item } from "@/types/item";
import { buscarOrcamentoPorId, finalizarOrcamento } from "@/services/orcamento.service";
import { listarItensPorOrcamento } from "@/services/item.service";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { NotFoundState } from "@/components/NotFoundState";
import { criarItem } from "@/services/item.service";
import AddItemForm from "@/components/AddItem";

export default function OrcamentoDetalhePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    const orcamentoId = Number(params.id);

    const [orcamento, setOrcamento] = useState<Orcamento>({
        id:0,
        numeroProtocolo:"",
        tipo:"OBRA_EDIFICACAO",
        valorTotal:0,
        dataCriacao:"",
        status:"ABERTO"
    });
    const [itens, setItens] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFinalizando, setIsFinalizando] = useState<boolean>(false);

    const load = async() => {
        try {
            setIsLoading(true);
            setError(null);
            const [orc, items] = await Promise.all([
                buscarOrcamentoPorId(orcamentoId),
                listarItensPorOrcamento(orcamentoId),
            ]);
            setOrcamento(orc);
            setItens(items);
        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar orçamento.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        load(); 
    }, [orcamentoId]);

    const somaItens = useMemo(() => {
        return itens.reduce((acc, item) => acc + Number(item.valorTotal ?? 0), 0);
    }, [itens]);

    const podeFinalizar = useMemo(() => {
        return Number(orcamento.valorTotal) === Number(somaItens);
    }, [orcamento, somaItens]);

    async function handleFinalizar() {
        try {
            setIsFinalizando(true);
            setError(null);
            const updated = await finalizarOrcamento(orcamento.id);
            setOrcamento(updated);

            await load();
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Erro ao carregar orçamentos.");
            }
        } finally {
            setIsFinalizando(false);
        }
    };

    if (isLoading) {
        return <LoadingState />;
    };
    if (error) {
        return <ErrorState message={error} actionLabel="Voltar" onAction={() => router.push("/orcamentos")} />;
    };
    if (!orcamento) {
        return <NotFoundState message="Orçamento não encontrado." />;
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Detalhe do Orçamento</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Protocolo: <span className="font-medium text-gray-900">{orcamento.numeroProtocolo}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="button" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                            onClick={() => router.push("/orcamentos")}>
                            Voltar
                        </button>

                        <button type="button" onClick={handleFinalizar} disabled={!podeFinalizar || isFinalizando}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
                            {isFinalizando ? "Finalizando..." : "Finalizar orçamento"}
                        </button>
                    </div>
                </header>

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{orcamento.tipo}</p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="mt-1">
                        <span className={ orcamento.status === "ABERTO"
                                ? "inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                                : "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                            }>
                            {orcamento.status}
                        </span>
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                        <p className="text-xs text-gray-500">Valor total do orçamento</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {Number(orcamento.valorTotal).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                        <p className="text-xs text-gray-500">Soma dos itens</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {Number(somaItens).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </p>
                        {orcamento.status === "ABERTO" && Number(somaItens) !== Number(orcamento.valorTotal) ? (
                        <p className="mt-1 text-xs text-gray-500">
                            Para finalizar, a soma dos itens deve ser igual ao valor total do orçamento.
                        </p>
                        ) : null}
                    </div>
                </section>

                <AddItemForm
                    orcamentoId={orcamento.id}
                    isDisabled={orcamento.status !== "ABERTO"}
                    onCreated={load}
                    onError={(message) => setError(message)}/>

                <section className="mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h2 className="text-sm font-medium text-gray-900">Itens do orçamento</h2>
                    </div>

                    {itens.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-gray-600">Nenhum item cadastrado.</div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold text-gray-600">
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Qtd</th>
                                <th className="px-4 py-3">V. Unit</th>
                                <th className="px-4 py-3">V. Total</th>
                                <th className="px-4 py-3">Qtd Acumulada</th>
                            </tr>
                            </thead>
                            <tbody>
                            {itens.map((item) => (
                                <tr key={item.id} className="border-t border-gray-200 text-sm">
                                <td className="px-4 py-3 text-gray-900">{item.descricao}</td>
                                <td className="px-4 py-3 text-gray-700">{Number(item.quantidade)}</td>
                                <td className="px-4 py-3 text-gray-700">
                                    {Number(item.valorUnitario).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                    })}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {Number(item.valorTotal).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                    })}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {Number(item.quantidadeAcumulada)}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
