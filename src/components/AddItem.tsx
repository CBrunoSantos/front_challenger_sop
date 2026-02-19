"use client";

import { useState } from "react";
import { criarItem } from "@/services/item.service";

type Props = {
    orcamentoId: number;
    isDisabled: boolean;
    onCreated: () => Promise<void> | void;
    onError?: (message: string) => void;
};

export default function AddItemForm({ orcamentoId, isDisabled, onCreated, onError }: Props){
    const [descricao, setDescricao] = useState<string>("");
    const [quantidade, setQuantidade] = useState<number>(0);
    const [valorUnitario, setValorUnitario] = useState<number>(0);
    const [isSubmittingItem, setIsSubmittingItem] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCriarItem(e: React.SubmitEvent) {
        e.preventDefault();

        if (isDisabled) {
            setError("Não é permitido incluir item em orçamento FINALIZADO.");
            return;
        }
        if (!descricao.trim()) {
            setError("Informe a descrição do item.");
            return;
        }
        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            setError("Informe uma quantidade válida.");
            return;
        }
        if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
            setError("Informe um valor unitário válido.");
            return;
        }
        try {
            setIsSubmittingItem(true);
            setError(null);

            await criarItem({
                descricao: descricao.trim(),
                quantidade,
                valorUnitario,
                orcamentoId,
            });

            setDescricao("");
            setQuantidade(0);
            setValorUnitario(0);

            await onCreated();
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message ?? "Erro ao criar orçamento.");
            }
        }  finally {
            setIsSubmittingItem(false);
        }
    };

    return (
        <section className="mt-6 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Adicionar item</h2>
                {isDisabled ? (
                    <span className="text-xs text-gray-500">
                        Orçamento finalizado: inclusão bloqueada.
                    </span>
                ) : null}
            </div>

            <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleCriarItem}>
                <div className="sm:col-span-3">
                    <label className="text-sm font-medium text-gray-900">Descrição</label>
                    <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                        disabled={isDisabled || isSubmittingItem}/>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-900">Quantidade</label>
                    <input value={quantidade} onChange={(e) => setQuantidade(parseFloat(e.target.value))} inputMode="decimal"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                        disabled={isDisabled || isSubmittingItem}/>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-900">Valor unitário</label>
                    <input value={valorUnitario} onChange={(e) => setValorUnitario(parseFloat(e.target.value))} inputMode="decimal"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                        disabled={isDisabled || isSubmittingItem}/>
                </div>

                <div className="flex items-end">
                    <button type="submit" disabled={isDisabled || isSubmittingItem}
                        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
                        {isSubmittingItem ? "Salvando..." : "Adicionar"}
                    </button>
                </div>

                {error ? (
                    <div className="sm:col-span-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}
            </form>
        </section>
    );
}