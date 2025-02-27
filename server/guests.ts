import { env } from '@/env';
import { api } from '@/lib/apiService';
import type { Channel } from '@/types';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;
const USER_MANAGEMENT_BASEURL = env.NEXT_PUBLIC_USER_MANAGEMENT_BASEURL;

export async function getGuestsOfHost() {
    const session = await getSession();
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getHostSpecificDriverDetails`;
    const payload = {
        hostID: session?.iduser
    };

    return await api.post<any>(url, payload);
}

export async function getGuestsHistory(driverId: string) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/getDriverRentalDetails`;
    const payload = {
        iduser: driverId
    };

    return await api.post<any>(url, payload);
}

export async function getDriverLicenseDetails(requestId: string, channel: Channel) {
    try {
        const url = `https://dvs2.idware.net/api/v3/Request/${requestId}/result`;
        // const token = channel === CHANNELS.FLUX ? env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN_FLUX : env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN_BUNDEE;
        const token = env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN_FLUX;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;

        const { verificationResult, request } = data;

        const { document, documentVerificationResult, faceVerificationResult } = verificationResult;

        const threshold = 90;

        // Extract images
        const images = {
            selfie: request?.content?.faceImageBase64 ?? '',
            front: request?.content?.frontImageBase64 ?? '',
            back: request?.content?.backOrSecondImageBase64 ?? ''
        };

        // Extract scores
        const scores = [
            {
                score: documentVerificationResult?.totalConfidence ?? 0, // Default to 0 if undefined or null
                label: 'Document Confidence',
                description:
                    documentVerificationResult?.totalConfidence >= threshold
                        ? "The document verification result indicates a high confidence level in the document's authenticity."
                        : "The document verification result indicates a low confidence level in the document's authenticity.",
                status: documentVerificationResult?.totalConfidence >= threshold ? 'success' : 'error',
                reason:
                    documentVerificationResult?.validationTests?.find((test: { name: string }) => test.name === 'IdentiFraudValidation')
                        ?.reason ?? 'Not Available'
            },
            {
                score: faceVerificationResult?.antiSpoofing ?? 0, // Default to 0 if undefined or null
                label: 'Anti-Spoofing',
                description:
                    faceVerificationResult?.antiSpoofing >= threshold
                        ? 'The anti-spoofing verification is successful, with no indication of tampering.'
                        : 'The anti-spoofing check failed or is incomplete.',
                status: faceVerificationResult?.antiSpoofing >= threshold ? 'success' : 'error'
            },
            {
                score: faceVerificationResult?.confidence ?? 0, // Default to 0 if undefined or null
                label: 'Face Match',
                description:
                    faceVerificationResult?.confidence >= threshold
                        ? 'The face match verification indicates a high confidence level, suggesting a match between document and selfie.'
                        : 'The face match verification indicates a low confidence level, suggesting a potential mismatch.',
                status: faceVerificationResult?.confidence >= threshold ? 'success' : 'error'
            },
            {
                score: documentVerificationResult?.verificationConfidence?.address ?? -1, // Default to -1 if undefined or null
                label: 'Address Validation',
                description:
                    documentVerificationResult?.verificationConfidence?.address >= threshold
                        ? 'Address validation is successful with high confidence.'
                        : 'Address validation is incomplete or failed.',
                status: documentVerificationResult?.verificationConfidence?.address >= threshold ? 'success' : 'error'
            },
            {
                status: 'Not Available',
                label: 'MVR',
                description:
                    'Run this check against motor vehicle records, confirming eligibility and compliance with driving regulations.',
                actionLabel: 'Run Check'
            },
            {
                status: 'Not Available',
                label: 'Background Check',
                description: "Run this check to verify the driver's identity, criminal history, and other relevant information.",
                actionLabel: 'Run Check'
            }
        ];

        // Extract personal information
        const personalInfo = {
            fullName: document?.fullName ?? 'Not Available',
            dob: document?.dob ?? 'Not Available',
            expires: document?.expires ?? 'Not Available',
            fullAddress:
                `${document?.address ?? 'Not Available'}, ${document?.city ?? ''}, ${document?.state ?? ''} ${document?.zip ?? ''}`.trim(),
            class: document?.class ?? 'Not Available',
            gender: document?.gender ?? 'Not Available',
            drivingLicenceNumber: document?.id ?? 'Not Available'
        };

        return { images, scores, personalInfo };
    } catch (error: any) {
        throw new Error(error.message);
    }
}
