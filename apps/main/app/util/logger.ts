import Logger from '@ioc:Adonis/Core/Logger';

export function logContext(
    functionName: string,
    dataObject: Record<string, string | null | number | Date> = {},
    log?: typeof Logger
) {
    const objectString = Object.entries(dataObject)
        .map(([key, value]) => `[${key} : ${value?.toString()}]`)
        .join(', ');

    const delimiter = objectString ? ' - ' : '';
    const ctx = `${functionName}${delimiter}${objectString}`;

    log?.info(ctx);

    return ctx;
}
