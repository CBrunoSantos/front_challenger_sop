"use client";

import { useEffect, useState } from "react";
import type { Item } from "@/types/item";
import { atualizarItem } from "@/services/item.service";
import {
    Alert,
    Button,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    NumberInput,
    Group,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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
    const isMobile = useMediaQuery('(max-width: 48em)');

    useEffect(() => {
        setDescricao(item.descricao ?? "");
        setQuantidade(item.quantidade ?? "");
        setValorUnitario(item.valorUnitario ?? "");
        setError(null);
    }, [item, isOpen]);

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
        <Modal opened={isOpen} onClose={onClose} title={<Text size="sm" fw={600}>Editar item</Text>} centered overlayProps={{ opacity: 0.3, blur: 1 }} size="lg" 
            closeOnClickOutside={!isSubmitting} closeOnEscape={!isSubmitting} withCloseButton={!isSubmitting}>
            <form onSubmit={handleSubmit}>
                <Stack gap="sm">
                    <TextInput label="Descrição" value={descricao} 
                        onChange={(e) => {
                            setDescricao(e.currentTarget.value);
                            if (error) {
                                setError(null);
                            }
                        }} disabled={isDisabled || isSubmitting} required/>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <NumberInput label="Quantidade" value={quantidade}
                            onChange={(value) => {
                                setQuantidade(typeof value === 'number' ? value : 0);
                                if (error) {
                                    setError(null);
                                }
                            }} disabled={isDisabled || isSubmitting} min={0} decimalScale={3} hideControls required/>
                        <NumberInput label="Valor unitário" value={valorUnitario}
                            onChange={(value) => {
                                setValorUnitario(typeof value === 'number' ? value : 0);
                                if (error) {
                                    setError(null);
                                }
                            }} disabled={isDisabled || isSubmitting} min={0} decimalScale={2} hideControls required/>
                    </SimpleGrid>

                    {error ? (
                        <Alert color="red" variant="light">
                            {error}
                        </Alert>
                    ) : null}

                    <Group justify="flex-end" gap="sm" mt="xs" wrap="wrap">
                        <Button type="button" variant="default" onClick={onClose} disabled={isSubmitting} fullWidth={isMobile}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={isSubmitting} disabled={isDisabled} fullWidth={isMobile}>
                            Salvar alterações
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
