"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchOrcamentos } from "@/store/slice/orcamentosSlice";
import {
    Anchor,
    Badge,
    Button,
    Card,
    Container,
    Group,
    ScrollArea,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function OrcamentosPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector(
        (state: RootState) => state.orcamentos
    );
    const isMobile = useMediaQuery('(max-width: 48em)');

    useEffect(() => {
        dispatch(fetchOrcamentos());
    }, [dispatch]);
    const totalAberto = useMemo(() => {
        return data.filter((o) => o.status === "ABERTO").length;
    }, [data]);

    const totalFinalizado = useMemo(() => {
        return data.filter((o) => o.status === "FINALIZADO").length;
    }, [data]);

return (
    <Container size="lg" py="md">
        <Stack gap="md">
            <Group justify="space-between" align="flex-end" wrap="wrap">
                <div>
                    <Title order={2}>Orçamentos</Title>
                    <Text size="sm" c="dimmed">
                        Lista de orçamentos cadastrados no sistema.
                    </Text>
                </div>
                <Button component={Link} href="/orcamentos/NovoOrcamento" fullWidth={isMobile}>
                    Novo orçamento
                </Button>
            </Group>

            <Group gap="sm" wrap="wrap">
                <Card withBorder radius="md" p="md" style={{ flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
                    <Text size="xs" c="dimmed">Abertos</Text>
                    <Text size="xl" fw={700}>{totalAberto}</Text>
                </Card>
                <Card withBorder radius="md" p="md" style={{ flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
                    <Text size="xs" c="dimmed">Finalizados</Text>
                    <Text size="xl" fw={700}>{totalFinalizado}</Text>
                </Card>
            </Group>
            <Card withBorder radius="md" padding={0}>
                <Group px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Text size="sm" fw={600}>
                        Resultados
                    </Text>
                </Group>

                {loading ? (
                    <Text px="md" py="md" size="sm" c="dimmed">Carregando...</Text>
                ) : error ? (
                    <Text px="md" py="md" size="sm" c="red">{error}</Text>
                ) : data.length === 0 ? (
                    <Text px="md" py="md" size="sm" c="dimmed">Nenhum orçamento encontrado.</Text>
                ) : (
                    <ScrollArea>
                        <Table striped highlightOnHover withTableBorder={false} withColumnBorders={false} miw={900}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Protocolo</Table.Th>
                                    <Table.Th>Tipo</Table.Th>
                                    <Table.Th>Valor</Table.Th>
                                    <Table.Th>Data</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.map((o) => {
                                    const badgeColor = o.status === 'ABERTO' ? 'yellow' : 'green';
                                    return(
                                        <Table.Tr key={o.id}>
                                            <Table.Td>
                                                <Anchor component={Link} href={`/orcamentos/${o.id}`} size="sm" c="dark" underline="hover">
                                                    {o.numeroProtocolo}
                                                </Anchor>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">{o.tipo}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {Number(o.valorTotal).toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">{o.dataCriacao}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={badgeColor} variant="light">
                                                    {o.status}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    )
                                })}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Card>
        </Stack>
    </Container>
);
}
