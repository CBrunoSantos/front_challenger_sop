"use client";

import { useEffect, useState } from "react";
import type { Item } from "@/types/item";
import { atualizarItem } from "@/services/item.service";

type Props = {
    isOpen: boolean;
    item: Item;
    isDisabled: boolean;
    onClose: () => void;
    onUpdated: () => Promise<void> | void;
};

export default function EditItemModal({ isOpen, item, isDisabled, onClose, onUpdated }: Props) {
    const [descricao, setDescricao] = useState<string>("");
    const [quantidade, setQuantidade] = useState<number>(0);
    const [valorUnitario, setValorUnitario] = useState<number>(0);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setDescricao(item.descricao ?? "");
        setQuantidade(item.quantidade ?? "");
        setValorUnitario(item.valorUnitario ?? "");
        setError(null);
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async function (e: React.SubmitEvent) {
        e.preventDefault();

        if (isDisabled) {
            return setError("Não é permitido editar item em orçamento FINALIZADO.");
        }

        if (!descricao.trim()) {
            return setError("Informe a descrição do item.");
        }

        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            return setError("Informe uma quantidade válida.");
        }

        if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
            return setError("Informe um valor unitário válido.");
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await atualizarItem(item.id, {
                descricao,
                quantidade,
                valorUnitario,
            });
            await onUpdated();
            onClose();
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message ?? "Erro ao editar item.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">Editar item</h3>
                </div>
                <form className="space-y-4 px-4 py-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-900">Descrição</label>
                        <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                            disabled={isDisabled || isSubmitting}/>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                        <label className="text-sm font-medium text-gray-900">Quantidade</label>
                        <input value={quantidade} onChange={(e) => setQuantidade(e.target.value === "" ? 0 : parseFloat(e.target.value))} inputMode="decimal"
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                            disabled={isDisabled || isSubmitting} />
                        </div>

                        <div>
                        <label className="text-sm font-medium text-gray-900">Valor unitário</label>
                        <input value={valorUnitario} onChange={(e) => setValorUnitario(e.target.value === "" ? 0 : parseFloat(e.target.value))} inputMode="decimal"
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                            disabled={isDisabled || isSubmitting}/>
                        </div>
                    </div>

                    {error ? (
                        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                    ) : null}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                        disabled={isSubmitting}>
                            Cancelar
                        </button>

                        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                            disabled={isDisabled || isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
