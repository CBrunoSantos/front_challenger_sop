"use client";

import { useState } from "react";
import { criarItem } from "@/services/item.service";
import {
    Alert,
    Button,
    Card,
    Group,
    NumberInput,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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
    const isMobile = useMediaQuery('(max-width: 48em)');
    const disabledByState = isDisabled || isSubmittingItem;

    const handleCriarItem = async function (e: React.SubmitEvent) {
        e.preventDefault();

        if (isDisabled) {
            return setError("Não é permitido incluir item em orçamento FINALIZADO.");
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
                setError(err.message ?? "Erro ao criar item.");
            }
        }  finally {
            setIsSubmittingItem(false);
        }
    };

    return (
        <Card withBorder radius="md" p="md" mt="md">
            <Group justify="space-between" align="center" wrap="wrap">
                <Text size="sm" fw={600}>
                    Adicionar item
                </Text>

                {isDisabled ? (
                    <Text size="xs" c="dimmed">
                        Orçamento finalizado: inclusão bloqueada.
                    </Text>
                ) : null}
            </Group>

            <form onSubmit={handleCriarItem}>
                <Stack gap="sm" mt="md">
                    <TextInput label="Descrição" value={descricao} onChange={(e) => {
                        setDescricao(e.currentTarget.value); 
                        if (error) { 
                            setError(null)
                        }
                    }} disabled={disabledByState} required/>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                        <NumberInput label="Quantidade" value={quantidade}
                            onChange={(value) => {
                                setQuantidade(typeof value === 'number' ? value : 0);
                                if (error) {
                                    setError(null);
                                }
                            }} disabled={disabledByState} min={0} decimalScale={3} hideControls required/>
                        <NumberInput label="Valor unitário" value={valorUnitario}
                            onChange={(value) => {
                                setValorUnitario(typeof value === 'number' ? value : 0);
                                if (error) {
                                setError(null);
                                }
                            }} disabled={disabledByState} min={0} decimalScale={2} hideControls required/>
                        <Group align="flex-end">
                            <Button type="submit" loading={isSubmittingItem} disabled={isDisabled} fullWidth>
                                Adicionar
                            </Button>
                        </Group>
                    </SimpleGrid>

                    {error ? (
                        <Alert  color="red" variant="light">
                            {error}
                        </Alert>
                    ) : null}
                </Stack>
            </form>
        </Card>
    );
}