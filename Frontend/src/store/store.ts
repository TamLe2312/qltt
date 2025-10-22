import { configureStore } from '@reduxjs/toolkit';
import { authReducer, orderCreateReducer, uiReducer, } from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    orderCreate: orderCreateReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
