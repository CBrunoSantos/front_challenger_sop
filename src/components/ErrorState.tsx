import React from "react";
import { PageShell } from "@/components/PageShell";

type ErrorStateProps = {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
};

export function ErrorState({ message, actionLabel = "Voltar", onAction }: ErrorStateProps) {
    return (
        <PageShell>
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
            {onAction ? (
                <button type="button"
                    className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    onClick={onAction}>
                    {actionLabel}
                </button>
            ) : null}
        </PageShell>
    );
}
