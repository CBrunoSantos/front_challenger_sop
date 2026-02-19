"use client";

import { useEffect, useMemo, useState } from "react";
import type { Item } from "@/types/item";
import type { ItemMedicao } from "@/types/medicao";
import { adicionarOuAtualizarItemMedicao, listarItensDaMedicao } from "@/services/medicao.service";

type Props = {
    medicaoId: number;
    itensOrcamento: Item[];
    onChanged: () => Promise<void> | void;
};

export default function MedicaoAbertaEditor({ medicaoId, itensOrcamento, onChanged }: Props) {
    const [itensMedicao, setItensMedicao] = useState<ItemMedicao[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [quantidades, setQuantidades] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({});

    const loadItensMedicao = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await listarItensDaMedicao(medicaoId);
            setItensMedicao(data);
            const initial: Record<number, string> = {};
            for (const im of data) {
                initial[im.itemId] = String(im.quantidadeMedida);
            }
            setQuantidades((prev) => ({ ...prev, ...initial }));
        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar itens da medição.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadItensMedicao();
    }, [medicaoId]);

    const byItemId = useMemo(() => {
        const map = new Map<number, ItemMedicao>();
        for (const im of itensMedicao){ 
            map.set(im.itemId, im);
        }
        return map;
    }, [itensMedicao]);

    const handleSalvar = async function (itemId: number) {
        const qtdStr = Number(quantidades[itemId]);

        if (!Number.isFinite(qtdStr) || qtdStr <= 0) {
            return setError("Informe uma quantidade medida válida.");
        }

        try {
            setIsSubmitting((prev) => ({ ...prev, [itemId]: true }));
            setError(null);

            await adicionarOuAtualizarItemMedicao(medicaoId, {
                itemId,
                quantidadeMedida: qtdStr,
            });

            await loadItensMedicao();
            await onChanged();
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message ?? "Erro ao criar item.");
            }
        } finally {
            setIsSubmitting((prev) => ({ ...prev, [itemId]: false }));
        }
    };
    
    const subtotalMedicao = useMemo(() => {
        return itensMedicao.reduce((acc, im) => acc + Number(im.valorTotalMedido ?? 0), 0);
    }, [itensMedicao]);

    return (
        <div className="mt-6 rounded-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Medição ABERTA: lançar itens</h3>
                {isLoading ? <span className="text-xs text-gray-500">Carregando...</span> : null}
            </div>

            <div className="mt-1 text-xs text-gray-600">
                Subtotal da medição (itens lançados):{" "}
                <span className="font-semibold text-gray-900">
                    {Number(subtotalMedicao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
            </div>

            {error ? (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : null}

            <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-semibold text-gray-600">
                            <th className="px-3 py-2">Item</th>
                            <th className="px-3 py-2">Qtd total</th>
                            <th className="px-3 py-2">Qtd acumulada</th>
                            <th className="px-3 py-2">Restante</th>
                            <th className="px-3 py-2">Qtd nesta medição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itensOrcamento.map((item) => {
                            const existente = byItemId.get(item.id);
                            const value = quantidades[item.id] ?? (existente ? String(existente.quantidadeMedida) : "");
                            const saving = Boolean(isSubmitting[item.id]);
                            const restante = Number(item.quantidade) - Number(item.quantidadeAcumulada);
                            const restanteSeguro = restante < 0 ? 0 : restante;
                            const bloqueadoPorRestante = restanteSeguro <= 0;

                            return (
                                <tr key={item.id} className="border-t border-gray-200 text-sm">
                                    <td className="px-3 py-2 text-gray-900">{item.descricao}</td>
                                    <td className="px-3 py-2 text-gray-700">{Number(item.quantidade)}</td>
                                    <td className="px-3 py-2 text-gray-700">{Number(item.quantidadeAcumulada)}</td>
                                    <td className="px-3 py-2 text-gray-700">{restanteSeguro}</td>
                                    <td className="px-3 py-2">
                                        <input value={value}
                                            onChange={(e) =>
                                                setQuantidades((prev) => ({ ...prev, [item.id]: e.target.value }))
                                            }
                                            inputMode="decimal"
                                            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-400"
                                            disabled={saving || bloqueadoPorRestante}/>

                                            {bloqueadoPorRestante ? (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Item já totalmente medido.
                                                </div>
                                                ) : null}
                                    </td>
                                    <td className="px-3 py-2">
                                        <button type="button" onClick={() => handleSalvar(item.id)}
                                            disabled={saving || bloqueadoPorRestante}
                                            className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60">
                                            {saving ? "Salvando..." : existente ? "Atualizar" : "Adicionar"}
                                        </button>
                                    </td>
                                    
                                </tr>
                            );
                        })};
                    </tbody>
                </table>
            </div>
        </div>
    );
}
