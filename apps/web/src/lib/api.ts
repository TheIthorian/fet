import type { Integration, Journey, OdometerReading, User, UserConfig, Vehicle } from '../types';

const TOKEN_KEY = 'fet_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (res.status === 401) {
        clearToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error((body['message'] as string) ?? res.statusText);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const api = {
    auth: {
        register: (email: string, password: string) =>
            req<{ token: string; user: User }>('/register', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        login: (email: string, password: string) =>
            req<{ token: string; user: User }>('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        me: () => req<{ data: User }>('/api/me'),
    },
    journeys: {
        list: () => req<Journey[]>('/api/journeys'),
    },
    vehicles: {
        list: () => req<Vehicle[]>('/api/vehicles'),
        create: (data: Omit<Vehicle, '_id' | 'userId' | 'createdAt'>) =>
            req<Vehicle>('/api/vehicles', { method: 'POST', body: JSON.stringify(data) }),
        odometer: {
            list: (vehicleId: string) => req<OdometerReading[]>(`/api/vehicles/${vehicleId}/odometer`),
            create: (vehicleId: string, data: { value: number; readingDate: string }) =>
                req<OdometerReading>(`/api/vehicles/${vehicleId}/odometer`, {
                    method: 'POST',
                    body: JSON.stringify(data),
                }),
        },
    },
    integrations: {
        list: () => req<Integration[]>('/api/me/integrations'),
        create: (name: string) => req<Integration>(`/api/me/integrations/${name}`, { method: 'POST' }),
    },
    config: {
        get: () => req<UserConfig>('/api/me/config'),
        update: (data: Partial<UserConfig>) =>
            req<UserConfig>('/api/me/config', { method: 'POST', body: JSON.stringify(data) }),
    },
};
