import type { CHANNELS, ROLES } from '@/constants';

export type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface NavItem {
    id?: number;
    title: string;
    href?: string;
    icon?: React.ReactNode;
    description?: string;
    items?: NavItem[];
    roles?: Role[];
}

export interface CreateUserProps {
    email: string;
    firstName: string;
    lastName: string;
    mobilePhone: string;
    channelName: string;
    employee?: boolean;
    hostId?: number | null;
}

export interface Booking {
    tripid: number;
    statusCode: string;
    reservationid: number;
    channelId: number;
    channelName: string;
    starttime: string;
    endtime: string;
    status: string;

    delivery: boolean;
    airportDelivery: boolean;
    isRentalAgreed: boolean;
    rentalAgreedDate: string;
    isLicenseVerified: boolean;
    isPhoneVarified: boolean;
    invoiceUrl: string | null;
    rentalAgrrementUrl: string | null;

    userid: number;
    userFirstName: string | null;
    userlastName: string | null;
    userImage: string | null;
    userEmail: string | null;
    userMobilePhone: string | null;

    vehicleId: number;
    vehicleImages: VehicleImage[] | [];
    vehicleNumber: string;
    vehmake: string;
    vehmodel: string;
    vehyear: string;
    vehcityname: string | null;
    vehzipcode: string;
    vehaddress1: string | null;
    vehaddress2: string | null;
    vehstate: string | null;
    vehicleDetails: Vehicle[];

    hostid: number;
    hostFirstName: string | null;
    hostLastName: string | null;
    hostPhoneNumber: string | null;
    hostImage: string | null;

    hostTripStartingBlobs: any[];
    hostTripCompletingBlobs: any[];
    driverTripStartingBlobs: any[];
    driverTripCompletingBlobs: any[];

    paymentFailedReason: string | null;
    paymentFailed: boolean;
    actualstarttime: string | null;
    actualendttime: string | null;
    tripstatus: number;
    openingMiles: number;
    closingMiles: number;

    isactive: boolean;

    tripCount: string | null;
    pickupLocation: string | null;
    logCompleted: string | number | null;
    unreadMsgCount: string | number | null;

    cancellationDays: number;
    bookingId: string;
    message: string | null;
    createddate: string;
    updateddate: string;

    tripModificationHistories: any[];
    swapDetails: any[];
    tripPaymentTokens: any[];
    paymentTransactions: any[];
    successfullPaymentTransactions: any[];
    cancelresponse: any[];
    tripSlipPayments: any[];
    rentalCharges: any[];
    tripChargeLedgers: any[];
    paymentCaptures: any[];
    tripPayementAuthResponses: any[];
    tripModificationDetails: any[];
    tripStatusTransactionResponses: any[];
    transactionCheckLists: any[];
    tripConstraints: any[];
    category?: 0 | 1 | 2 | 3 | 4;

    [key: string]: any; // Catch-all for additional keys with uncertain types
}

export interface VehicleImage {
    idimage: number;
    orderNumber: number;
    isPrimary: boolean;
    vehicleid: number;
    imagename: string;
    userid: number;
    isactive: boolean;
    createdate: string;
    updatedate: string;
    imageUuid: string | null;
}

export interface Vehicle {
    id: number;
    vin: string;
    make: string;
    model: string;
    year: string;
    price_per_hr: number;
    latitude: string | null;
    longitude: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    [key: string]: any;
}
