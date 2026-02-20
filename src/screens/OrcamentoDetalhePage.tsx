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
import EditItemModal from "@/components/EditItemModal";
import MedicoesSection from "@/components/MedicoesSection";
import {
    Badge,
    Button,
    Card,
    Container,
    Group,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<Item>({
        id: 0, 
        descricao: "", 
        quantidade: 0, 
        valorUnitario: 0, 
        valorTotal:0, 
        quantidadeAcumulada:0, 
        orcamentoId:0
    });
    const statusColor = orcamento.status === 'ABERTO' ? 'yellow' : 'green';
    const isMobile = useMediaQuery('(max-width: 48em)');

    function openEdit(item: Item) {
        setSelectedItem(item);
        setIsEditOpen(true);
    }

    function closeEdit() {
        setIsEditOpen(false);
        setSelectedItem(selectedItem);
    }

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
        <Container size="lg" py="md">
            <Stack gap="md">
                <Group justify="space-between" align="flex-start" wrap="wrap">
                    <div>
                        <Title order={2}>Detalhe do Orçamento</Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Protocolo:{' '}
                            <Text component="span" fw={600} c="dark">
                            {orcamento.numeroProtocolo}
                            </Text>
                        </Text>
                    </div>

                    <Group gap="sm" wrap="wrap" style={{ width: isMobile ? '100%' : 'auto' }}>
                        <Button variant="default" onClick={() => router.push('/orcamentos')} fullWidth={isMobile}>
                            Voltar
                        </Button>
                        <Button onClick={handleFinalizar} disabled={!podeFinalizar} loading={isFinalizando} fullWidth={isMobile}>
                            Finalizar orçamento
                        </Button>
                    </Group>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Card withBorder radius="md" p="md">
                        <Text size="xs" c="dimmed">Tipo</Text>
                        <Text size="sm" fw={600} mt={4}>
                            {orcamento.tipo}
                        </Text>
                    </Card>

                    <Card withBorder radius="md" p="md">
                        <Text size="xs" c="dimmed">
                            Status
                        </Text>
                        <Group mt={6}>
                            <Badge color={statusColor} variant="light">
                                {orcamento.status}
                            </Badge>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" p="md">
                        <Text size="xs" c="dimmed">
                            Valor total do orçamento
                        </Text>
                        <Text size="sm" fw={600} mt={4}>
                            {Number(orcamento.valorTotal).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </Text>
                    </Card>

                    <Card withBorder radius="md" p="md">
                        <Text size="xs" c="dimmed">Soma dos itens</Text>
                        <Text size="sm" fw={600} mt={4}>
                            {Number(somaItens).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </Text>
                        {orcamento.status === 'ABERTO' && Number(somaItens) !== Number(orcamento.valorTotal) ? (
                            <Text size="xs" c="dimmed" mt={6}>
                                Para finalizar, a soma dos itens deve ser igual ao valor total do orçamento.
                            </Text>
                        ) : null}
                    </Card>
                </SimpleGrid>

                <AddItemForm
                    orcamentoId={orcamento.id}
                    isDisabled={orcamento.status !== "ABERTO"}
                    onCreated={load}
                    onError={(message) => setError(message)}/>

                <Card withBorder radius="md" padding={0}>
                    <Group px="md" py="sm" justify="space-between" style={{ borderBottom:'1px solid var(--mantine-color-gray-3)'}}>
                        <Text size="sm" fw={600}>Itens do orçamento</Text>
                    </Group>

                    {itens.length === 0 ? (
                        <Text px="md" py="md" size="sm" c="dimmed">Nenhum item cadastrado</Text>
                    ) : (
                        <ScrollArea>
                            <Table striped highlightOnHover miw={1000}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Descrição</Table.Th>
                                        <Table.Th>Qtd</Table.Th>
                                        <Table.Th>V. Unit</Table.Th>
                                        <Table.Th>V. Total</Table.Th>
                                        <Table.Th>Qtd Acumulada</Table.Th>
                                        <Table.Th>Ações</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {itens.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td><Text size="sm">{item.descricao}</Text></Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {Number(item.quantidade)}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {Number(item.valorUnitario).toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {Number(item.valorTotal).toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">{Number(item.quantidadeAcumulada)}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Button variant="default" size="xs" disabled={orcamento.status !== 'ABERTO'} onClick={() => openEdit(item)} fullWidth={isMobile}>                                                    
                                                    Editar
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr >
                                    ))}
                                </Table.Tbody>
                            </Table>
                            <EditItemModal
                                isOpen={isEditOpen}
                                item={selectedItem}
                                isDisabled={orcamento.status !== "ABERTO"}
                                onClose={closeEdit}
                                onUpdated={load}/>
                        </ScrollArea>
                    )}
                </Card>
                <MedicoesSection orcamentoId={orcamento.id} itensOrcamento={itens} isOrcamentoFinalizado={orcamento.status !== "ABERTO"}/>
            </Stack>
        </Container>
    );
}
