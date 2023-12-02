import { writable } from 'svelte/store';

type UserDetails = {
    userId: number;
    isSetupRequired: boolean;
    vehicleCount: number;
    email: string;
    displayName: string;
    userConfig: UserDetailsConfig;
};

type UserDetailsConfig = {
    isGeolocationEnabled: boolean;
};

export const user = writable<UserDetails>({
    userId: 1,
    isSetupRequired: true,
    vehicleCount: 1,
    email: '',
    displayName: '',
    userConfig: { isGeolocationEnabled: false },
});
