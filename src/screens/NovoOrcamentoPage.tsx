"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarOrcamento } from "@/services/orcamento.service";
import type { OrcamentoTipo } from "@/types/orcamento";

const TIPOS: { value: OrcamentoTipo; label: string }[] = [
    { value: "OBRA_EDIFICACAO", label: "Obra de Edificação" },
    { value: "OBRA_RODOVIAS", label: "Obra de Rodovias" },
    { value: "OUTROS", label: "Outros" },
];

export default function NovoOrcamentoPage() {
    const router = useRouter();
    const [numeroProtocolo, setNumeroProtocolo] = useState<string>("");
    const [tipo, setTipo] = useState<OrcamentoTipo>("OBRA_EDIFICACAO");
    const [valorTotal, setValorTotal] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async function (e: React.SubmitEvent) {
        try {
            setIsSubmitting(true);
            setError(null);
            const created = await criarOrcamento({
                numeroProtocolo: numeroProtocolo.trim(),
                tipo,
                valorTotal,
            });
            router.push(`/orcamentos/${created.id}`);
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message ?? "Erro ao criar orçamento.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-2xl px-4 py-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Novo Orçamento</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Preencha os dados abaixo para cadastrar um novo orçamento.
                    </p>
                </header>

                <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-900">Número do protocolo</label>
                            <input
                                value={numeroProtocolo}
                                onChange={(e) => setNumeroProtocolo(e.target.value)}
                                placeholder='Ex: 43022.123456/2026-01'
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-900">Tipo de orçamento</label>
                            <select value={tipo} onChange={(e) => setTipo(e.target.value as OrcamentoTipo)}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400">
                                {TIPOS.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-900">Valor total</label>
                            <input
                                value={valorTotal}
                                onChange={(e) => setValorTotal(parseFloat(e.target.value))}
                                inputMode="decimal"
                                placeholder="1500.00"
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Use ponto para decimais (ex: 1500.00).
                            </p>
                        </div>

                        {error ? (
                            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/orcamentos")}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                                disabled={isSubmitting}>
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                                disabled={isSubmitting}>
                                {isSubmitting ? "Salvando..." : "Criar orçamento"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
