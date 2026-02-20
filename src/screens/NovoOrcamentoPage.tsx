"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarOrcamento } from "@/services/orcamento.service";
import type { OrcamentoTipo } from "@/types/orcamento";
import {
    Button,
    Card,
    Container,
    Group,
    NumberInput,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
    Alert,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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
    const isMobile = useMediaQuery('(max-width: 48em)');

    const handleSubmit = async function (e: React.SubmitEvent) {
        e.preventDefault();
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
        <Container size="sm" py="md">
            <Stack gap="md">
                <div>
                    <Title order={2}>Novo Orçamento</Title>
                    <Text size="sm" c="dimmed" mt={4}>
                        Preencha os dados abaixo para cadastrar um novo orçamento.
                    </Text>
                </div>
                <Card withBorder radius="md" p="lg">
                    <form onSubmit={handleSubmit}>
                        <Stack gap="sm">
                            <TextInput label="Número do protocolo" placeholder="Ex: 43022.123456/2026-01" value={numeroProtocolo}
                                onChange={(e) => setNumeroProtocolo(e.currentTarget.value)} disabled={isSubmitting} required/>

                            <Select label="Tipo de orçamento" value={tipo} 
                                onChange={(value) => {
                                    if (value) {
                                        setTipo(value as OrcamentoTipo);
                                    }
                                }} data={TIPOS.map((t) => ({ value: t.value, label: t.label }))} disabled={isSubmitting} required searchable={false} allowDeselect={false}/>

                            <NumberInput label="Valor total" placeholder="1500.00" value={valorTotal} onChange={(value) => setValorTotal(typeof value === 'number' ? value : 0)}
                                disabled={isSubmitting} min={0} decimalScale={2} thousandSeparator="." decimalSeparator="," hideControls required />

                            <Text size="xs" c="dimmed">
                                Use ponto para decimais no backend; aqui no input já formatamos no padrão BR.
                            </Text>

                            {error ? (
                                <Alert color="red" variant="light">
                                    {error}
                                </Alert>
                            ) : null}

                            <Group justify="flex-end" gap="sm" mt="xs" wrap="wrap">
                                <Button type="button" variant="default" onClick={() => router.push('/orcamentos')} disabled={isSubmitting}  fullWidth={isMobile}>
                                    Cancelar
                                </Button>
                                <Button type="submit" loading={isSubmitting} fullWidth={isMobile}>
                                    Criar orçamento
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Card>
            </Stack>
        </Container>
    );
}
