import type { UiState } from './slices/uiSlice';
import type { AuthState } from './slices/authSlice';

export interface RootState {
  auth: AuthState;
  ui: UiState;
}


