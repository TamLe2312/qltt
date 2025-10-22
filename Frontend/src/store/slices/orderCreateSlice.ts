import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderCreateState {
    user_id: string | null;
    branch_id: string | null;
    note: string | null;
    street: string | null;
    ward: string | null;
    district: string | null;
    city: string | null;
    country: string | null;
    zipcode: string | null;
    products: SelectedProduct[];
}

interface SelectedProduct {
    product_id: number | string,
    quantity: number | string,
    price: number | string,
}

const initialState: OrderCreateState = {
    user_id: null,
    branch_id: null,
    note: null,
    street: null,
    ward: null,
    district: null,
    city: null,
    country: null,
    zipcode: null,
    products: []
};


const orderCreateSlice = createSlice({
    name: "orderCreate",
    initialState,
    reducers: {
        // Cập nhật bất kỳ field nào trong state
        setData: (state, action: PayloadAction<Partial<OrderCreateState>>) => {
            Object.assign(state, action.payload);
        },
        // Reset state về initialState
        resetData: () => initialState
    }
});

export const { setData, resetData } = orderCreateSlice.actions;
export default orderCreateSlice.reducer;