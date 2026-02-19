import React from "react";
import { PageShell } from "@/components/PageShell";

type LoadingStateProps = {
    message?: string;
};

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
    return (
        <PageShell>
            <div className="text-sm text-gray-600">{message}</div>
        </PageShell>
    );
}
