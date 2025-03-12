import type { CHANNELS, ROLES } from '@/constants';
import type { ReactNode } from 'react';

interface BaseNavItem {
    title: string;
    badge?: string;
    icon?: ReactNode;
    roles?: Role[];
}

export type NavLink = BaseNavItem & {
    url: string;
    items?: never;
};

export type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: string })[];
    url?: string;
};

export type NavItem = NavCollapsible | NavLink;

export interface ISidebar {
    title: string;
    items: NavItem[];
}

export type HomePageNavItem = {
    icon: React.ReactNode;
    label: string;
    href: string;
    roles: Role[];
};

export type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface CreateUserProps {
    email: string;
    firstName: string;
    lastName: string;
    mobilePhone: string;
    channelName: string;
    employee?: boolean;
    hostId?: number | null;
    userRole: Role;
}

export interface Trip {
    tripid: number;
    version: number;
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
    drivingLicenseStatus: string;
    isInsuranceVerified: boolean;
    insuranceStatus: any;
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

    isDebitCard: boolean;
    cardDetails: CardDetail[];
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
    tripPaymentTokens: Pricelist[];
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
    completedDate: string;
    depositCollected?: boolean;

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

interface CardDetail {
    id: number;
    userId: number;
    tripId: number;
    oldMethodIdToken: string;
    newMethodIdToken: string;
    createdDate: string;
    updatedDate: string | null;
    isActive: boolean;
    cardType: 'credit' | 'debit' | 'prepaid' | 'other'; // Extend as needed
    last4Digit: string;
    cardBrand: string;
}

interface Pricelist {
    capturedDays: number;
    depositHoldAmount: number;
    chargedAmountOnHold: number;
    id: number;
    reservationid: number;
    userid: number;
    hostid: number;
    channelid: number;
    vehicleid: number;
    deductionfrequencyconfigid: number;
    paymentauthorizationconfigid: number;
    authorizationamount: number;
    authorizationpercentage: number;
    releasedAmountOnHold: number;
    totaldays: number;
    perdayamount: number;
    totalamount: number;
    createddate: string;
    updateddate: any;
    tripid: number;
    strippaymenttoken: string;
    strippaymentid: string;
    strippaymenttokenactiveflag: boolean;
    isactive: boolean;
    paymentrecieveddate: string;
    stripetransactiondetails: string;
    paymentmethodidtoken: string;
    customertoken: string;
    setupIntentToken: string;
    tripAmount: number;
    taxAmount: number;
    tripTaxAmount: number;
    discountedDays: number;
    discountPercentage: number;
    discountAmount: number;
    tripDiscountedAmount: number;
    upCharges: number;
    deliveryCost: number;
    tripFee: number;
    charges: number;
    taxPercentage: number;
    numberOfDaysDiscount: number;
    concessionCalculated: number;
    concessionPercentage: number;
    concessionFee: number;
    registrationRecoveryFee: number;
    extreaMilageCost: number;
    Statesurchargetax: number;
    Statesurchargeamount: number;
    tripFeeAmount: number;
    capturedAmount: number;
    refundAmount: number;
    extraMileageCost: number;
    extraMilage: number;
    lateFee: number;
    extraDayCharges: number;
    registrationFee: number;
    averageRentalDays: number;
}

export interface SwapVehicles {
    imageresponse: VehicleImage[];
    tripreview: any[];
    mileageConstraints: any[];
    discountsConstraints: any[];
    deliveryDetails: any[];
    vehicleMinMaxDays: any[];
    hostPriceResponses: any[];
    id: number;
    vin: string;
    make: string;
    model: string;
    series: any;
    backupCamera: any;
    desciption: string;
    year: string;
    cityname: string;
    price_per_hr: number;
    latitude: string;
    createdDate: any;
    longitude: string;
    address1: string;
    delivery: boolean;
    airportDelivery: boolean;
    address2: string;
    zipcode: string;
    state: string;
    name: string;
    bedtype: any;
    transmissionStyle: any;
    bodyclass: any;
    busfloortype: any;
    bustype: any;
    cabtype: any;
    custommotortype: any;
    doors: any;
    drivetype: any;
    electrificationlevel: any;
    enginebrake: any;
    enginepower: any;
    frontairbaglocation: any;
    fueltypeprimary: any;
    manufacturename: any;
    engineNumberOfCylinders: any;
    motorcyclechasistype: any;
    motorcyclesuspensiontype: any;
    othetengineinfo: any;
    OtherRestraintSystemInfo: any;
    plantCity: any;
    plantCompanyName: any;
    plantCountry: any;
    plantstate: any;
    seatbelttype: any;
    SideAirBagLocations: any;
    SteeringLocation: any;
    tirePressure: any;
    trailerBodyType: any;
    trailerTypeConnection: any;
    trim: any;
    turbo: any;
    vehicleType: any;
    count: number;
    tripcount: number;
    rating: number;
    wishList: boolean;
    vehicleDescription: any;
    seatingCapacity: string;
    parkingDetails: any;
    guideLines: any;
    policies: any;
    GuestInstructionsAndGuideLines: string;
    completedStages: any;
    vehicleState: any;
    color: any;
    number: string;
    isActive: boolean;
    uploadStatus: any;
    country: any;
    isDiscountAvailable: boolean;
}

export interface TelematicsData {
    tripId: number;
    bundeeBookingId: number;
    driverId: number;
    odometerStart: number;
    odometerEnd: number;
    tripDistance: number;
    tripScore: number;
    tripMaxSpeed: number;
    tripAverageSpeed: number;
    scorePenalty: number;
    isActive: boolean;
    isEarlyMorningDriven: boolean;
    isLateNightDriven: boolean;
    isHighSpeedLimitCrossed: boolean;
    isAvgSpeedLimitCrossed: boolean;
    isImpactDetected: boolean;
    tripUUID: string;
    deviceId: string;
    vin: string;
    tripStart: any;
    tripEnd: any;
    hardAccelerationCount: number;
    hardBrakingCount: number;
    impactCount: number;
    overSpeedingCount: number;
    hardTurningCount: number;
    vehicleID: number;
}

export interface CollectionStatus {
    id: number;
    statusName: string;
}

export interface TripChargeLedgerList {
    id: number;
    typeCode: string;
    typeDescription: string;
    chargeAmount: number;
    chargeTax: number;
    chargeTotal: number;
    collectionDeadLine: string;
    collectionStatusId: number;
    isPreTripCharge: boolean;
    isDebt: boolean;
    isDiscount: boolean;
    createdDate: string;
    bookingId: number;
    userId: number;
    hostId: number;
    collectedDate: any;
    chargesId: any;
    code: string;
    collectionAllowed: boolean;
}

export interface RentalCharge {
    isCardChange: boolean;
    id: number;
    chargeAmount: number;
    chargeTax: number;
    chargeTotal: number;
    collectionDeadLine: string;
    rentalDate: string;
    collectionStatusId: number;
    isDebt: boolean;
    toBeConsidered: boolean;
    isDiscount: boolean;
    createdDate: string;
    chargesId: any;
    bookingId: number;
    userId: number;
    hostId: number;
    total: number;
    registrationRecoveryFee: number;
    concessionFee: number;
    stateSurcharge: number;
    collectedDate: any;
    code: string;
    label: string;
    totalDiscount: number;
    taxDiscountDisqualifier: number;
    taxDiscount: number;
    stateSurchargeDiscountDisqualifier: number;
    stateSurchargeDiscount: number;
    chargesDiscountDisqualifier: number;
    chargesDiscount: number;
    collectionAllowed: boolean;
    isRentalChargesRefund: boolean;
}

export interface UserDetail {
    iduser: number;
    firstname: string;
    phoneNumberUpdatedDate: any;
    middlename: string;
    lastname: string;
    email: string;
    mobilephone: string;
    address_1: string;
    address_2: string;
    address_3: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    language: string;
    driverlisense: string;
    isactive: boolean;
    employee: boolean;
    vehicleowner: boolean;
    createddate: string;
    updateddate: string;
    userimage: string;
    firebaseId: any;
    userRole: string;
    channelName: string;
    channelId: number;
    isVerified: boolean;
    isPhoneVarified: boolean;
    isEmailVarified: boolean;
}
