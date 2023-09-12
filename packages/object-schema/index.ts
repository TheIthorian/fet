import type { RequestHandler, Response } from 'express';
import { logContext, makeLogger } from '../logger';
import { z } from 'zod';
import { SchemaValidationError } from 'fet-errors';

const log = makeLogger(module);

export function QuerySchemaValidator<SchemaType extends z.ZodType>(
    schema: SchemaType
): RequestHandler {
    return function schemaValidation(req, res, next) {
        const result = validateData(schema, req.query ?? {});

        if (!result.success) {
            const error = result.error;
            log.error(error, 'QuerySchemaValidator - validation failed');
            throw new SchemaValidationError('query', error);
        } else {
            res.locals.parsedQuery = result.data;
        }

        next();
    };
}

export function BodySchemaValidator<SchemaType extends z.ZodType>(
    schema: SchemaType
): RequestHandler {
    return function schemaValidation(req, res, next) {
        const result = validateData(schema, req.body ?? {});

        if (!result.success) {
            const error = result.error;
            log.error(error, 'BodySchemaValidator - validation failed');
            throw new SchemaValidationError('body', error);
        } else {
            res.locals.parsedBody = result.data;
        }

        next();
    };
}

export function ParamSchemaValidator<SchemaType extends z.ZodType>(
    schema: SchemaType
): RequestHandler {
    const ctx = logContext(ParamSchemaValidator.name, {}, log);
    return function schemaValidation(req, res, next) {
        log.info(`${ctx} - validating params (${JSON.stringify(req.params) ?? 'no params'})`);
        const result = validateData(schema, req.params ?? {});

        if (!result.success) {
            const error = result.error;
            log.error(error, 'ParamSchemaValidator - validation failed');
            throw new SchemaValidationError('params', error);
        } else {
            res.locals.parsedParams = result.data;
            log.info(
                `${ctx} - res.locals.parsedParams: ${JSON.stringify(req.params) ?? 'no params'}`
            );
        }

        next();
    };
}

type FailedValidationResult = { success: false; code: number; error: z.ZodError<z.ZodIssue> };
type SuccessfulValidationResult<T> = { success: true; data: T };
type ValidationResult<T> = FailedValidationResult | SuccessfulValidationResult<T>;
export function validateData<SchemaType extends z.ZodType>(
    schema: SchemaType,
    data: unknown
): ValidationResult<z.infer<SchemaType>> {
    const result = schema.safeParse(data);

    if (!result.success) {
        const error = (result as z.SafeParseError<typeof data>).error;
        log.error(error, 'QuerySchemaValidator - validation failed');

        return {
            success: false,
            code: 400,
            error,
        };
    }

    return { success: true, data: result.data };
}

export interface ParsedQueryResponse<T> extends Response {
    locals: Record<string, any> & { parsedQuery: T };
}

export interface ParsedBodyResponse<T> extends Response {
    locals: Record<string, any> & { parsedBody: T };
}

export interface ParsedParamsResponse<T> extends Response {
    locals: Record<string, any> & { parsedParams: T };
}

export function parseLimit(limit?: number, maxLimit = 100) {
    const DEFAULT_LIMIT = 10;

    if (limit === undefined) {
        return DEFAULT_LIMIT;
    }

    if (limit > maxLimit) {
        return maxLimit;
    }

    return limit;
}
