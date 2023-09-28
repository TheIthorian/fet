import { setTimeout } from 'node:timers/promises';

export interface Database<T extends object> {
    get: (id: string) => Promise<T | null>;
    put: (id: string, value: T) => Promise<void>;
    pop: (id: string) => Promise<T | null>;
    search: (property: keyof T, value: ValueOf<T, keyof T>) => Promise<T | undefined>;
}

export class MemoryDatabase<T extends object> implements Database<T> {
    private storage: Map<string, T> = new Map<string, T>();

    async get(id: string): Promise<T | null> {
        await setTimeout();
        return this.storage.get(id) ?? null;
    }

    async put(id: string, value: T): Promise<void> {
        await setTimeout();
        this.storage.set(id, value);
    }

    async pop(id: string): Promise<T | null> {
        await setTimeout();

        const journey = this.storage.get(id) ?? null;
        this.storage.delete(id);

        return journey;
    }

    async search(property: keyof T, value: ValueOf<T, keyof T>): Promise<T | undefined> {
        await setTimeout();

        const allRecords = this.storage.values();
        let foundRecord: T | undefined;
        for (const record of allRecords) {
            if (record[property] === value) {
                foundRecord = record;
            }
        }
        return foundRecord;
    }
}

type ValueOf<T, K extends keyof T> = T[K];
