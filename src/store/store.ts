import { configureStore } from "@reduxjs/toolkit";
import orcamentosReducer from "@/store/slice/orcamentosSlice";

export const store = configureStore({
    reducer: {
        orcamentos: orcamentosReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
