import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";

export interface Orcamento {
    id: number;
    numeroProtocolo: string;
    tipo: string;
    valorTotal: number;
    status: string;
    dataCriacao: string;
}

interface OrcamentosState {
    data: Orcamento[];
    loading: boolean;
    error: string | null;
}

const initialState: OrcamentosState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchOrcamentos = createAsyncThunk("orcamentos/fetchOrcamentos", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get("/orcamentos/listar");
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Erro ao buscar orçamentos."
        );
    }
});

const orcamentosSlice = createSlice({
    name: "orcamentos",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchOrcamentos.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchOrcamentos.fulfilled, (state, action: PayloadAction<Orcamento[]>) => {
            state.loading = false;
            state.data = action.payload;
        })
        .addCase(fetchOrcamentos.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export default orcamentosSlice.reducer;
