import { setTimeout } from 'node:timers/promises';
import { ulid } from 'ulid';

export interface Database<T extends object> {
    get: (id: string) => Promise<T | null>;
    put: (value: T) => Promise<string>;
    pop: (id: string) => Promise<T | null>;
}

export class MemoryDatabase<T extends object> implements Database<T> {
    private storage: Map<string, T> = new Map<string, T>();

    async get(id: string): Promise<T | null> {
        await setTimeout();
        return this.storage.get(id) ?? null;
    }

    async put(value: T): Promise<string> {
        await setTimeout();
        const id = ulid();
        this.storage.set(id, value);
        return id;
    }

    async pop(id: string): Promise<T | null> {
        await setTimeout();

        const journey = this.storage.get(id) ?? null;
        this.storage.delete(id);

        return journey;
    }
}
