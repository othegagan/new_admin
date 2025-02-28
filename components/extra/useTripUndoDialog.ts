import { create } from 'zustand';

interface TripUndoDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useTripUndoDialog = create<TripUndoDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false })
}));

export default useTripUndoDialog;
