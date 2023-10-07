import { ConfigError } from 'fet-errors';

export function validateObjectIsNotNull(obj: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(obj)) {
        validatePropertyIsNotNull(key, value);
    }
}

function validatePropertyIsNotNull(key: string, value: unknown): void {
    if (!isConfigType(value)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        throw new ConfigError({ [key]: value });
    }

    if (!isObject(value)) {
        return;
    }

    validateObjectIsNotNull(value);
}
type ConfigType = string | number | Record<string, unknown> | boolean;

function isConfigType(obj: unknown): obj is ConfigType {
    if (obj === undefined || obj === null || obj === '') {
        return false;
    }

    return ['string', 'number', 'object', 'boolean'].includes(typeof obj);
}

function isObject(obj: ConfigType): obj is Record<string, unknown> {
    return typeof obj === 'object';
}
