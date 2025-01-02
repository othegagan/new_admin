import type { Trip } from '@/types';
import { create } from 'zustand';

interface TripModificationDialogStore {
    tripData: Trip | null;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    submitted: boolean;
    success: boolean;
    setSubmitted: (value: boolean) => void;
    setSuccess: (value: boolean) => void;
    message: string | null;
    setMessage: (value: string | null) => void;
    setTripData: (value: Trip) => void;
}

const useTripModificationDialog = create<TripModificationDialogStore>((set) => ({
    tripData: null,
    isOpen: false,
    submitted: false,
    success: false,
    message: null,
    setTripData: (value) => set({ tripData: value }),
    setSubmitted: (value) => set({ submitted: value }),
    setSuccess: (value) => set({ success: value }),
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setMessage: (value) => set({ message: value })
}));

export default useTripModificationDialog;
