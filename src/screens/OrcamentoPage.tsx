"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listarOrcamentos } from "@/services/orcamento.service";
import type { Orcamento } from "@/types/orcamento";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrcamentosPage() {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef<boolean>(false);
    const router = useRouter();

    const load = async() => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await listarOrcamentos();
            if (isMountedRef.current) {
                setOrcamentos(data);
            }
        } catch (error: unknown) {
            if (isMountedRef.current) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Erro ao carregar orçamentos.");
                }
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        isMountedRef.current = true;
        load();
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const totalAberto = useMemo(() => {
        return orcamentos.filter((o) => o.status === "ABERTO").length;
    }, [orcamentos]);

    const totalFinalizado = useMemo(() => {
        return orcamentos.filter((o) => o.status === "FINALIZADO").length;
    }, [orcamentos]);

return (
    <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Orçamentos</h1>
                    <p className="text-sm text-gray-600">
                        Lista de orçamentos cadastrados no sistema.
                    </p>
                </div>
                <Link href="/orcamentos/NovoOrcamento" 
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                    Novo orçamento
                </Link>

                <div className="flex gap-3">
                    <div className="rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
                        <p className="text-xs text-gray-500">Abertos</p>
                        <p className="text-lg font-semibold text-gray-900">{totalAberto}</p>
                    </div>
                    <div className="rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
                        <p className="text-xs text-gray-500">Finalizados</p>
                        <p className="text-lg font-semibold text-gray-900">{totalFinalizado}</p>
                    </div>
                </div>
            </header>
            <section className="mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                <div className="border-b border-gray-200 px-4 py-3">
                    <h2 className="text-sm font-medium text-gray-900">Resultados</h2>
                </div>

                {isLoading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Carregando...</div>
                ) : error ? (
                    <div className="px-4 py-6 text-sm text-red-600">{error}</div>
                ) : orcamentos.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">
                        Nenhum orçamento encontrado.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-600">
                                    <th className="px-4 py-3">Protocolo</th>
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3">Valor</th>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orcamentos.map((o) => (
                                    <tr key={o.id} className="border-t border-gray-200 text-sm">
                                        <td className="px-4 py-3 text-gray-900">
                                            <Link href={`/orcamentos/${o.id}`} className="text-gray-900 hover:underline">
                                                {o.numeroProtocolo}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{o.tipo}</td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {Number(o.valorTotal).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{o.dataCriacao}</td>
                                        <td className="px-4 py-3">
                                            <span className={ o.status === "ABERTO"
                                                    ? "inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                                                    : "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                                                }>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button type="button" onClick={() => router.push(`/orcamentos/${o.id}`)}
                                                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-900 hover:bg-gray-50">
                                                Visualizar
                                            </button>
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
