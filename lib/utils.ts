import { parseZonedDateTime } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import moment from 'moment-timezone';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import zipToTimeZone from 'zipcode-to-timezone';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function JSONparsefy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

export function toTitleCase(str: string) {
    return str?.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) || str;
}

export function roundToTwoDecimalPlaces(num: number) {
    try {
        return Number.parseFloat(num.toString()).toFixed(2);
    } catch (error) {
        console.error('Error rounding to two decimal places:', error);
        return 0;
    }
}

export function currencyFormatter({ value, roundTo = 2 }: { value: number | string; roundTo?: number }): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: roundTo
    }).format(Number(value));
}

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTimeZoneByZipcode(zipCode: string): string {
    return zipToTimeZone.lookup(zipCode || 73301) || ''; // 73301, (Los angeles zip code : 90274) (MST : 85323)
}

/**
* Converts a given date, time, and zip code to a specific zipcode timezone ISO string.

* @param datetime - The date in YYYY-MM-DDTHH:MM:SS format.
* @param zipCode - The zip code to determine the timezone.
* @returns The converted date and time in ISO format with the zipcode timezone.
* @throws Will throw an error if the timezone cannot be determined from the zip code.
*/
export function convertToTimeZoneISO(datetime: string, zipCode: string) {
    const timeZone = getTimeZoneByZipcode(zipCode);
    const converedCarDate = parseZonedDateTime(`${datetime}[${timeZone}]`).toAbsoluteString();

    return converedCarDate;
}

/**
 * Converts a given date from UTC to the specified time zone format.
 *
 * @param datetime - The date in YYYY-MM-DDTHH:MM:SS  format or UTC format.
 * @param zipCode - The zip code to determine the timezone.
 * @param format - Desired format of the converted date. ex: 'yyyy-MM-DD'. or 'YYYY-MM-DDTHH:mm:ss'
 * @returns The converted date and time in local zipcode time zone format.
 */
export function formatDateAndTime(date: string, zipCode: string, format = 'MMM DD, YYYY | h:mm A z'): string {
    const endTimeUTC = moment.utc(date);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const timeInTimeZone = endTimeUTC.tz(timeZone);

    return timeInTimeZone.format(format);
}

export function getFullAddress({ vehicleDetails, tripDetails }: { vehicleDetails?: any; tripDetails?: any }): string {
    if (!vehicleDetails && !tripDetails) return '';

    const addressParts = [];
    if (vehicleDetails) {
        if (vehicleDetails.address1) {
            addressParts.push(toTitleCase(vehicleDetails.address1));
        }
        if (vehicleDetails.address2) {
            addressParts.push(toTitleCase(vehicleDetails.address2));
        }
        if (vehicleDetails.zipcode || vehicleDetails.zipCode) {
            addressParts.push(vehicleDetails.zipcode || vehicleDetails.zipCode);
        }
        if (vehicleDetails.cityname || vehicleDetails.cityName) {
            addressParts.push(toTitleCase(vehicleDetails.cityname || vehicleDetails.cityName));
        }
        if (vehicleDetails.state) {
            addressParts.push(toTitleCase(vehicleDetails.state));
        }
        if (vehicleDetails.country) {
            addressParts.push(toTitleCase(vehicleDetails.country));
        }
    } else if (tripDetails) {
        if (tripDetails.vehaddress1) {
            addressParts.push(toTitleCase(tripDetails.vehaddress1));
        }
        if (tripDetails.vehaddress2) {
            addressParts.push(toTitleCase(tripDetails.vehaddress2));
        }
        if (tripDetails.vehzipcode) {
            addressParts.push(tripDetails.vehzipcode);
        }
        if (tripDetails.vehcityname) {
            addressParts.push(toTitleCase(tripDetails.vehcityname));
        }
        if (tripDetails.vehstate) {
            addressParts.push(toTitleCase(tripDetails.vehstate));
        }
    }

    const address = toTitleCase(addressParts.join(', '));

    return address;
}

export function splitFormattedDateAndTime(input: string): React.ReactElement | string {
    const parts = input.split(' | ');
    if (parts.length !== 2) {
        return input; // Return the original input if it doesn't split into exactly two parts
    }
    const [datePart, timePart] = parts;
    return React.createElement(
        React.Fragment,
        null,
        React.createElement('span', null, datePart),
        React.createElement('br'),
        React.createElement('span', null, timePart)
    );
}

/**
 * Function to check if a string is a URL or a Base64 string
 * @param str - The input string to validate
 * @returns { 'url' | 'base64' | 'invalid' } - Returns 'url', 'base64', or 'invalid'
 */
export function checkStringType(str: string): 'url' | 'base64' | 'invalid' {
    // Regular expression to validate URLs
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;

    // Regular expression to validate Base64 strings
    const base64Pattern = /^(data:(?:[a-z]+\/[a-z0-9.-]+)?;base64,)?[A-Za-z0-9+/]+={0,2}$/;

    // Check if the string is a valid URL
    if (urlPattern.test(str)) {
        return 'url';
    }

    // Check if the string is a valid Base64 string
    if (base64Pattern.test(str)) {
        return 'base64';
    }

    // Return 'invalid' if neither condition is met
    return 'invalid';
}
