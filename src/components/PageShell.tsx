import React from "react";

type PageShellProps = {
    children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
        </main>
    );
}
