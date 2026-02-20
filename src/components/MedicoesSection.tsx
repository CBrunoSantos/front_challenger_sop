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
import {
    Alert,
    Badge,
    Button,
    Card,
    Group,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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
    const isMobile = useMediaQuery('(max-width: 48em)');

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

    const disableCreate = isOrcamentoFinalizado || Boolean(medicaoAberta) || isSubmitting;

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
        <Card withBorder radius="md" padding={0} mt="md">
            <Group px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Text size="sm" fw={600}>
                    Medições
                </Text>
            </Group>
            <Stack px="md" py="md" gap="md">
                {isLoading ? (
                    <Text size="sm" c="dimmed">Carregando medições...</Text>
                ) : null}

                {error ? (
                    <Alert color="red" variant="light">{error}</Alert>
                ) : null}

                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                    <Card withBorder radius="md" p="md">
                        <Group justify="space-between" align="center" wrap="wrap">
                            <Text size="sm" fw={600}>
                                Nova medição
                            </Text>
                            {isOrcamentoFinalizado ? (
                                <Text size="xs" c="dimmed">
                                    Orçamento finalizado
                                </Text>
                            ) : medicaoAberta ? (
                                <Text size="xs" c="dimmed">
                                    Existe medição ABERTA
                                </Text>
                            ) : null}
                        </Group>

                        <form onSubmit={handleCriarMedicao}>
                            <Stack gap="sm" mt="sm">
                                <TextInput label="Número" value={numero} onChange={(e) => setNumero(e.currentTarget.value)} disabled={disableCreate} required/>
                                <TextInput label="Data" type="date" value={dataMedicao} onChange={(e) => setDataMedicao(e.currentTarget.value)} disabled={disableCreate}
                                    required description="Formato: YYYY-MM-DD"/>
                                <TextInput label="Observação" value={observacao} onChange={(e) => setObservacao(e.currentTarget.value)} disabled={disableCreate}/>
                                <Button type="submit" fullWidth loading={isSubmitting} disabled={disableCreate}>
                                    Criar medição
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                    <Card withBorder radius="md" p="md">
                        <Group justify="space-between" align="center" wrap="wrap">
                            <Text size="sm" fw={600}> Histórico</Text>
                            {medicaoAberta ? (
                                <Button type="button" size="xs" onClick={handleValidarMedicao} loading={isValidando} disabled={isOrcamentoFinalizado}>
                                    Validar medição aberta
                                </Button>
                            ) : null}
                        </Group>
                        {medicoes.length === 0 && !isLoading ? (
                            <Text size="sm" c="dimmed" mt="sm">
                                Nenhuma medição cadastrada.
                            </Text>
                        ) : null}
                        {medicoes.length > 0 ? (
                            <ScrollArea mt="sm">
                                <Table striped highlightOnHover miw={650}>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Número</Table.Th>
                                            <Table.Th>Data</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                            <Table.Th>Valor</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {medicoes.map((m) => {
                                            const badgeColor = m.status === 'ABERTA' ? 'yellow' : 'green';
                                            return(
                                                <Table.Tr key={m.id}>
                                                    <Table.Td>
                                                        <Text size="sm">{m.numero}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{m.dataMedicao}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge color={badgeColor} variant="light">
                                                            {m.status}
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" c="dimmed">
                                                            {Number(m.valorTotal).toLocaleString("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            })}
                                                        </Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        ) : null}
                    </Card>
                </SimpleGrid>
                {medicaoAberta ? (
                    <MedicaoAbertaEditor
                        medicaoId={medicaoAberta.id}
                        itensOrcamento={itensOrcamento}
                        onChanged={load}
                    />
                ) : null}
            </Stack>
        </Card>
    );
}
