import React from "react";
import { PageShell } from "@/components/PageShell";

type NotFoundStateProps = {
    message?: string;
};

export function NotFoundState({ message = "Orçamento não encontrado." }: NotFoundStateProps) {
    return (
        <PageShell>
            <div className="text-sm text-gray-600">{message}</div>
        </PageShell>
    );
}
