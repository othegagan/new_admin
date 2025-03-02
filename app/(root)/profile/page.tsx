'use client';

import { AddressCombobox } from '@/components/extra/address-combo-box';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { stateList } from '@/constants';
import { useUser } from '@/hooks/useUser';
import { getUserByEmail, updateUser } from '@/server/user';
import type { UserDetail } from '@/types';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { MdVerified } from 'react-icons/md';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { data: response, isLoading, error, isError } = useUser();

    if (isLoading)
        return (
            <div className='h-full w-full '>
                <CarLoadingSkeleton />
            </div>
        );

    if (isError) return <div>Error: {error.message}</div>;

    if (!response?.success) return <div>Error: {response?.message}</div>;

    const userDetails: UserDetail = response?.data?.userResponse || {};

    return (
        <div className='mx-auto h-full w-full max-w-4xl px-4 py-6 md:pl-6'>
            <div className='grid h-fit w-full grid-cols-1 gap-4 md:h-full md:grid-cols-4'>
                <div className='col-span-1 flex h-fit flex-col items-center'>
                    <ProfilePicComponent userDetails={userDetails} />
                </div>

                <div className='col-span-1 flex h-full flex-1 flex-col md:col-span-3'>
                    <ProfileDetailsComponent userDetails={userDetails} />
                </div>
            </div>
        </div>
    );
}

function ProfilePicComponent({ userDetails }: { userDetails: UserDetail }) {
    const [image, setImage] = useState(userDetails?.userimage);

    const { refetchAll } = useUser();

    const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event?.target?.files?.[0];
        if (!file) {
            toast.error('No file selected.');
            return;
        }

        if (file) {
            if (file.size > 1048576) {
                toast.error('Please select an image size less than 1 MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                const resultAsString = reader.result as string;
                setImage(resultAsString);
                try {
                    const response = await getUserByEmail();
                    if (response?.success) {
                        const data = response?.data?.userResponse;
                        // console.log(data)
                        const payload = {
                            iduser: data.iduser,
                            firstname: data.firstname,
                            middlename: '',
                            lastname: data.lastname || '',
                            mobilePhone: data.mobilephone || '',
                            address_1: data.address_1 || '',
                            address_2: data.address_2 || '',
                            address_3: data.address_3 || '',
                            city: data.city || '',
                            state: data.state || '',
                            postcode: data.postCode || '',
                            country: data.country || '',
                            language: data.language || '',
                            driverlisense: data.driverlisense || '',
                            vehicleowner: false,
                            fromValue: 'completeProfile',
                            userimage: resultAsString.split(',')[1] || '',
                            isPhoneVarified: data.isPhoneVarified,
                            isEmailVarified: true
                        };

                        const updateResponse = await updateUser(payload);
                        if (updateResponse.success) {
                            toast.success('Profile photo updated successful.');
                            refetchAll();
                        } else {
                            toast.error('Something went wrong, Try again.');
                        }
                    }
                } catch (error) {
                    console.error('Error updating profile data:', error);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <>
            <div className='relative'>
                <div className='h-32 w-32 overflow-hidden rounded-full'>
                    <img src={image || '/images/dummy_avatar.png'} alt='Profile' className='h-full w-full object-cover object-center' />
                </div>

                <label
                    htmlFor='profilePictureInput'
                    className='absolute right-0 bottom-0 rounded-full border-2 bg-muted p-2 hover:shadow-md'>
                    <Pencil className='h-4 w-4' />
                    <input id='profilePictureInput' type='file' className='hidden' onChange={handleProfilePictureChange} />
                </label>
            </div>

            <h2 className='mt-4 font-semibold text-xl capitalize'>
                {userDetails?.firstname} {userDetails?.lastname}
            </h2>
            <p className='text-muted-foreground text-sm'>
                Joined on {userDetails.createddate ? format(userDetails.createddate, 'MMM yyyy') : null}
            </p>
        </>
    );
}

function ProfileDetailsComponent({ userDetails }: { userDetails: UserDetail }) {
    const { update, data } = useSession();

    const [savedData, setSavedData] = useState({
        ...userDetails,
        isEmailVarified: true
    });

    const [activeSection, setActiveSection] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    const handleEditClick = (section: any) => {
        setActiveSection(section);
    };

    const handleCancelClick = () => {
        setActiveSection(null);
    };

    const handleInputChange = (key: any, value: any) => {
        setSavedData((prevData) => ({
            ...prevData,
            [key]: value
        }));
    };

    const handleSubmit = async () => {
        setProcessing(true);

        const updatePayload = {
            iduser: Number(userDetails.iduser),
            firstname: savedData.firstname || '',
            middlename: '',
            lastname: savedData.lastname || '',
            mobilePhone: savedData.mobilephone || '',
            address_1: savedData.address_1 || '',
            address_2: savedData.address_2 || '',
            address_3: '',
            city: savedData.city || '',
            state: savedData.state || '',
            postcode: savedData.postcode || '',
            country: savedData.country || 'USA',
            language: savedData.language || '',
            driverlisense: savedData.driverlisense || '',
            vehicleowner: false,
            userimage: savedData.userimage || '',
            isEmailVarified: true,
            isPhoneVarified: savedData.isPhoneVarified,
            fromValue: 'completeProfile'
        };

        try {
            // console.log('Profile Update payload :', updatePayload);
            const response = await updateUser(updatePayload);
            // console.log(response);
            if (response.success) {
                toast.success(response.message);
                await update({ ...data, name: `${savedData?.firstname} ${savedData?.lastname}` });
                setTimeout(() => {
                    window.location.reload();
                }, 800);
                handleCancelClick();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('error updating details', error);
            toast.error(`Failed to update your profile. ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    function handleAddressChange(address: any) {
        setSavedData({ ...savedData, address_1: address.address1, city: address.city, state: address.state, postcode: address.zipcode });
    }

    return (
        <div className='flex flex-col gap-6 md:gap-10'>
            <div className='space-y-4'>
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'>Name</h2>
                        {activeSection !== 'name' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'phoneNumber' ? 'cursor-not-allowed ' : ''}
                                onClick={() => handleEditClick('name')}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    {activeSection === 'name' ? (
                        <div className='mt-5 flex flex-col gap-4'>
                            <div className='grid grid-cols-1 gap-4 gap-y-2 pr-5 text-sm md:max-w-md md:grid-cols-4 '>
                                <div className='md:col-span-2'>
                                    <Label>First Name</Label>
                                    <Input
                                        type='text'
                                        value={savedData.firstname}
                                        onChange={(e) => {
                                            handleInputChange('firstname', e.target.value);
                                        }}
                                    />
                                </div>

                                <div className='md:col-span-2'>
                                    <Label>Last Name</Label>
                                    <Input
                                        type='text'
                                        value={savedData.lastname}
                                        onChange={(e) => {
                                            handleInputChange('lastname', e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <Button
                                className='max-w-fit'
                                type='button'
                                disabled={processing}
                                loading={processing}
                                loadingText='Saving'
                                variant='black'
                                onClick={handleSubmit}>
                                Save
                            </Button>
                        </div>
                    ) : (
                        <div>
                            {savedData.firstname} {savedData.lastname}
                        </div>
                    )}
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'> Phone Number</h2>
                        {activeSection !== 'phoneNumber' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'phoneNumber' ? 'cursor-not-allowed ' : ''}
                                onClick={() => {
                                    // phoneNumberVerification.onOpen();
                                }}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    <div>
                        {savedData.mobilephone}
                        {savedData.isPhoneVarified && (
                            <span className='ml-2 inline-block'>
                                <MdVerified className='size-4 text-green-600' />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <h2 className=' font-semibold text-base leading-7'>Email</h2>
                    <div>
                        {savedData.email}
                        {savedData.email && (
                            <span className='ml-2 inline-block'>
                                <MdVerified className='size-4 text-green-600' />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'>Address Details</h2>
                        {activeSection !== 'address' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'address' ? 'cursor-not-allowed ' : ''}
                                onClick={() => handleEditClick('address')}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    {activeSection === 'address' ? (
                        <div className='mt-5 flex flex-col gap-4'>
                            <div className='flex flex-col gap-2'>
                                <Label>Address 1</Label>
                                <AddressCombobox
                                    locationDetails={savedData.address_1}
                                    setLocationDetails={handleAddressChange}
                                    searchType='address'
                                />
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Address 2</Label>
                                <Input
                                    type='text'
                                    value={savedData.address_2}
                                    onChange={(e) => handleInputChange('address2', e.target.value)}
                                />
                            </div>

                            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                                <div className='flex flex-col gap-2'>
                                    <Label>City</Label>
                                    <Input type='text' value={savedData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label>State</Label>
                                    <select
                                        id='state'
                                        name='state'
                                        value={savedData.state}
                                        onChange={(e) => {
                                            handleInputChange('state', e.target.value);
                                        }}
                                        className='h-9 rounded border p-1 text-sm outline-hidden'>
                                        <option value='' disabled>
                                            Select State
                                        </option>
                                        {stateList.map((state) => (
                                            <option key={state.name} value={state.name}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <Label>Zip code</Label>
                                    <Input
                                        type='text'
                                        value={savedData.postcode}
                                        onChange={(e) => {
                                            handleInputChange('postcode', e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <Button
                                className='max-w-fit'
                                type='button'
                                disabled={processing}
                                loading={processing}
                                loadingText='Saving'
                                variant='black'
                                onClick={handleSubmit}>
                                Save
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div>
                                {savedData.address_1 && `${savedData.address_1},`}
                                {savedData.address_2 && `${savedData.address_2}, `}
                                {savedData.city && `${savedData.city}, `}
                                {savedData.state && `${savedData.state}, `}
                                {savedData.postcode && `${savedData.postcode}, `}
                                {savedData.country && savedData.country}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
