"use client";

import { useEffect, useMemo, useState } from "react";
import type { Item } from "@/types/item";
import type { ItemMedicao } from "@/types/medicao";
import { adicionarOuAtualizarItemMedicao, listarItensDaMedicao } from "@/services/medicao.service";
import {
    Alert,
    Button,
    Card,
    Group,
    NumberInput,
    ScrollArea,
    Stack,
    Table,
    Text,
} from '@mantine/core';

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
        <Card withBorder radius="md" p="md" mt="md">
            <Group justify="space-between" align="center" wrap="wrap">
                <Text size="sm" fw={600}>
                    Medição ABERTA: lançar itens
                </Text>
                {isLoading ? ( <Text size="xs" c="dimmed"> Carregando...</Text>) : null}
            </Group>
            <Text size="xs" c="dimmed" mt={6}>
                Subtotal da medição (itens lançados):{' '}
                <Text component="span" fw={700} c="dark">
                    {Number(subtotalMedicao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
            </Text>
            {error ? (
            <Alert color="red" variant="light" mt="sm">
                {error}
            </Alert>
            ) : null}

            <Stack gap="sm" mt="md">
                <ScrollArea>
                    <Table striped highlightOnHover miw={1000}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Item</Table.Th>
                                <Table.Th>Qtd total</Table.Th>
                                <Table.Th>Qtd acumulada</Table.Th>
                                <Table.Th>Restante</Table.Th>
                                <Table.Th>Qtd nesta medição</Table.Th>
                                <Table.Th>Ação</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {itensOrcamento.map((item) => {
                                const existente = byItemId.get(item.id);
                                const value = quantidades[item.id] ?? (existente ? String(existente.quantidadeMedida) : "");
                                const saving = Boolean(isSubmitting[item.id]);
                                const restante = Number(item.quantidade) - Number(item.quantidadeAcumulada);
                                const restanteSeguro = restante < 0 ? 0 : restante;
                                const bloqueadoPorRestante = restanteSeguro <= 0;

                                return (
                                    <Table.Tr key={item.id}>
                                        <Table.Td> 
                                            <Text size="sm">{item.descricao}</Text>
                                        </Table.Td>
                                        <Table.Td> 
                                            <Text size="sm" c="dimmed"> {Number(item.quantidade)} </Text>
                                        </Table.Td>
                                        <Table.Td> 
                                            <Text size="sm" c="dimmed">{Number(item.quantidadeAcumulada)}</Text>
                                        </Table.Td>
                                        <Table.Td> 
                                            <Text size="sm" c="dimmed"> {restanteSeguro}</Text> 
                                        </Table.Td>
                                        <Table.Td>
                                            <Stack gap={4}>
                                                <NumberInput value={value}
                                                    onChange={(val) => {
                                                        setQuantidades((prev) => ({
                                                            ...prev,
                                                            [item.id]:
                                                            val === null || val === '' ? '' : String(val),
                                                        }));
                                                    }}
                                                    inputMode="decimal"
                                                    className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-400"
                                                    disabled={saving || bloqueadoPorRestante}/>

                                                {bloqueadoPorRestante ? (
                                                    <Text size="xs" c="dimmed">
                                                    Item já totalmente medido.
                                                    </Text>
                                                ) : null}
                                            </Stack>
                                        </Table.Td>
                                        <Table.Td>
                                            <Button type="button" size="xs" loading={saving} disabled={bloqueadoPorRestante} onClick={() => handleSalvar(item.id)} >
                                                {existente ? 'Atualizar' : 'Adicionar'}
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Stack>
        </Card>
    );
}
