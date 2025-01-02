import { create } from 'zustand';

interface SwapDialogStore {
    isOpen: boolean;
    swapType: 'force' | 'propose';
    currentVehicleDetails: any;
    newVehicleDetails: any;
    tripId: number;
    userId: number;
    hostId: number;
    onOpen: () => void;
    onClose: () => void;
    setSwapType: (swapType: 'force' | 'propose') => void;
    setCurrentVehicleDetails: (vehicleDetails: any) => void;
    setNewVehicleDetails: (vehicleDetails: any) => void;
    setTripId: (tripId: number) => void;
    setUserId: (userId: number) => void;
    setHostId: (hostId: number) => void;
}

const useSwapDialog = create<SwapDialogStore>((set) => ({
    isOpen: false,
    swapType: 'force',
    currentVehicleDetails: null,
    newVehicleDetails: null,
    tripId: 0,
    userId: 0,
    hostId: 0,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setSwapType: (swapType: 'force' | 'propose') => set({ swapType }),
    setCurrentVehicleDetails: (vehicleDetails: any) => set({ currentVehicleDetails: vehicleDetails }),
    setNewVehicleDetails: (vehicleDetails: any) => set({ newVehicleDetails: vehicleDetails }),
    setTripId: (tripId: number) => set({ tripId }),
    setUserId: (userId: number) => set({ userId }),
    setHostId: (hostId: number) => set({ hostId })
}));

export default useSwapDialog;
