import { createSearchParamsCache, createSerializer, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs/server';

export const searchParams = {
    page: parseAsInteger.withDefault(1),
    page_size: parseAsInteger.withDefault(10),
    search_query: parseAsString,
    sort_column: parseAsString,
    sort_direction: parseAsStringLiteral(['asc', 'desc'] as const)
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
