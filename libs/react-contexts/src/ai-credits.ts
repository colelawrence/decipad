import { create } from 'zustand';

interface AiCreditsStore {
  setIsBuyCreditsModalOpen: (isOpen: boolean) => void;
  isBuyCreditsModalOpen?: boolean;
}

export const useAiCreditsStore = create<AiCreditsStore>((set) => ({
  isBuyCreditsModalOpen: false,
  setIsBuyCreditsModalOpen: (isModalOpen: boolean) =>
    set(() => ({
      isBuyCreditsModalOpen: isModalOpen,
    })),
}));
