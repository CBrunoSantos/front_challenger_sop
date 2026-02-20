'use client';

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MantineProvider, createTheme } from '@mantine/core';
import { store } from '@/store/store';


const theme = createTheme({
    primaryColor: 'dark',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
});

type Props = {
    children: React.ReactNode;
};

export default function Providers({ children }: Props) {
    return (
    <ReduxProvider store={store}>
        <MantineProvider theme={theme}>{children}</MantineProvider>
    </ReduxProvider>
    );
}