import { logger } from "@/logger";

// Base parser type
type AttributeParser<T = any> = (value: string | null) => T;

// Parser factory functions
export function createBooleanParser(defaultValue: boolean = false): AttributeParser<boolean> {
    return (value: string | null) => {
        if (value === null) return defaultValue;
        if (value === "") return true; // bare attribute like `dismissible`
        return value === "true";
    };
}

export function createEnumParser<T extends string>(options: {
    name: string;
    validValues: readonly T[];
    defaultValue: T;
}): AttributeParser<T> {
    return (value: string | null) => {
        const { name, validValues, defaultValue } = options;
        if (value === null) return defaultValue;
        if (!validValues.includes(value as T)) {
            logger.warn(`invalid attribute name: ${name}; value: ${value}, fallback to default value: ${defaultValue}`);
            return defaultValue;
        }
        return value as T;
    };
}

// Helper function to create typed attribute parsers
export function createAttributeParsers<T extends Record<string, AttributeParser>>(
    parsers: T
): T & { getObservedAttributes(): string[] } {
    return {
        ...parsers,
        getObservedAttributes: () => Object.keys(parsers),
    };
}
