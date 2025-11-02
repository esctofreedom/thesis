import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyBlurState {
  isBlurred: boolean;
  toggleBlur: () => void;
  setBlur: (isBlurred: boolean) => void;
}

export const useCurrencyBlur = create<CurrencyBlurState>()(
  persist(
    (set) => ({
      isBlurred: false,
      toggleBlur: () => set((state) => ({ isBlurred: !state.isBlurred })),
      setBlur: (isBlurred) => set({ isBlurred }),
    }),
    {
      name: 'currency-blur-storage',
    }
  )
);

