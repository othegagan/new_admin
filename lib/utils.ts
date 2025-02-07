import { CHANNELS, DEFAULT_ZIPCODE } from '@/constants';
import { parseZonedDateTime } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import moment from 'moment-timezone';
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

export function roundToTwoDecimalPlaces(num: number | string): string {
    try {
        return Number.parseFloat(num.toString()).toFixed(2); // Always returns a string with 2 decimal places
    } catch (error) {
        console.error('Error rounding to two decimal places:', error);
        return '0.00'; // Return a fallback value as a string
    }
}

export function currencyFormatter(value: number | string, roundTo = 2): string {
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
    return zipToTimeZone.lookup(zipCode || DEFAULT_ZIPCODE) || ''; // 73301, (Los angeles zip code : 90274) (MST : 85323)
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
export function formatDateAndTime(date: string | Date, zipCode: string, format = 'MMM DD, YYYY | h:mm A z'): string {
    const timeUTC = moment.utc(date);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const timeInTimeZone = timeUTC.tz(timeZone);

    return timeInTimeZone.format(format);
}

/**
 * Function to format time from a given date time string and zip code
 * @param dateTimeString - The date time string to format
 * @param zipCode - The zip code to determine the timezone.
 * @returns The formatted time in local zipcode time zone format.
 * @throws Will throw an error if the timezone cannot be determined from the zip code.
 * @example
 * formatTime('2023-03-01T00:00:00', '73301')
 * // Output: '12:00:00'
 */
export function formatTime(dateTimeString: string, zipCode: string) {
    const timeZone = getTimeZoneByZipcode(zipCode);
    const time = moment(dateTimeString).tz(timeZone).format('HH:mm:ss');
    return time;
}

/**
 * Generates start and end dates for a given zip code and timezone.
 * @param {number} startDateOffset - The number of months to offset the start date by.
 * @param {number} endDateOffset - The number of months to offset the end date by.
 * @returns {Object} - An object containing `startDate` and `endDate`.
 */
export function generateStartAndEndDates(zipCode: string, startDateOffset = 1, endDateOffset = 1) {
    const timeZone = getTimeZoneByZipcode(zipCode);

    if (!moment.tz.zone(timeZone)) {
        console.error('Timezone not found:', timeZone);
        return { startDate: '', endDate: '' };
    }

    // Start date: Beginning of the day in the timezone, adjusted by months offset
    const startDate = moment.tz(timeZone).subtract(startDateOffset, 'months').startOf('day').utc().format('YYYY-MM-DD');

    // End date: End of the day in the timezone, adjusted by months offset
    const endDate = moment.tz(timeZone).add(endDateOffset, 'months').endOf('day').utc().format('YYYY-MM-DD');

    return { startDate, endDate };
}

/**
 * Converts a date string from YYYY-MM-DD format to a readable format like Dec 7, 2024.
 * @param {string} dateStr - The date string in YYYY-MM-DD format.
 * @returns {string} - The formatted date string (e.g., Dec 7, 2024).
 */
export function formatDateToReadable(dateStr: string): string {
    const date = moment(dateStr, 'YYYY-MM-DD', true);

    if (!date.isValid()) {
        console.error('Invalid date string:', dateStr);
        return '';
    }

    return date.format('MMM D, YYYY');
}

export function getFullAddress({ vehicleDetails, tripDetails }: { vehicleDetails?: any; tripDetails?: any }): string {
    if (!vehicleDetails && !tripDetails) return '';

    const addressParts: any[] = [];

    const details = vehicleDetails || tripDetails;
    if (details) {
        const fields = [
            'address1',
            'address2',
            'zipcode',
            'zipCode',
            'cityname',
            'cityName',
            'state',
            'country',
            'vehaddress1',
            'vehaddress2',
            'vehzipcode',
            'vehcityname',
            'vehstate'
        ];

        fields.forEach((field) => {
            if (details[field]) {
                addressParts.push(toTitleCase(details[field]));
            }
        });
    }

    return toTitleCase(addressParts.join(', '));
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

/**
 * Function to check if a channel name is a Turo channel
 * @param channelName - The channel name to check
 * @returns {boolean} - Returns true if the channel name is a Turo channel, false otherwise
 */
export function checkForTuroTrip(channelName: string): boolean {
    return channelName.toLowerCase().includes(CHANNELS.TURO.toLowerCase());
}
