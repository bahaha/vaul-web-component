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

export function createNumberParser(options: {
    defaultValue: number;
    min?: number;
    max?: number;
    name?: string; // Optional name for logging
}): AttributeParser<number> {
    return (value: string | null) => {
        const { defaultValue, min, max, name = "unknown" } = options;
        if (value === null) return defaultValue;

        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            logger.warn(
                `invalid attribute name: ${name}; value: ${value} is not a number, fallback to default value: ${defaultValue}`
            );
            return defaultValue;
        }

        if (min !== undefined && parsed < min) {
            logger.warn(
                `invalid attribute name: ${name}; value: ${parsed} is below minimum ${min}, fallback to default value: ${defaultValue}`
            );
            return defaultValue;
        }

        if (max !== undefined && parsed > max) {
            logger.warn(
                `invalid attribute name: ${name}; value: ${parsed} is above maximum ${max}, fallback to default value: ${defaultValue}`
            );
            return defaultValue;
        }

        return parsed;
    };
}

// Attribute configuration types
interface BooleanAttributeConfig {
    name: string;
    type: "boolean";
    defaultValue?: boolean;
}

interface EnumAttributeConfig<T extends string> {
    name: string;
    type: "enum";
    validValues: readonly T[];
    defaultValue: T;
}

interface NumberAttributeConfig {
    name: string;
    type: "number";
    defaultValue: number;
    min?: number;
    max?: number;
}

type AttributeConfigUnion = BooleanAttributeConfig | EnumAttributeConfig<any> | NumberAttributeConfig;

// Utility function for consistent camelCase conversion
const camelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

// Helper functions to create attribute configs with better type safety
export const attr = {
    boolean: (name: string, defaultValue = true): BooleanAttributeConfig => ({
        name,
        type: "boolean",
        defaultValue,
    }),

    enum: <T extends string>(name: string, validValues: readonly T[], defaultValue: T): EnumAttributeConfig<T> => ({
        name,
        type: "enum",
        validValues,
        defaultValue,
    }),

    number: (name: string, defaultValue: number, options?: { min?: number; max?: number }): NumberAttributeConfig => ({
        name,
        type: "number",
        defaultValue,
        min: options?.min,
        max: options?.max,
    }),
};

// Enhanced parser system with automatic attribute-to-property mapping
export function createParsersFromConfig<T extends readonly AttributeConfigUnion[]>(
    configs: T
): Record<T[number]["name"], AttributeParser> & {
    getObservedAttributes(): string[];
    getPropertyMapping(): Record<string, string>;
    updateProperty(element: any, attributeName: string, attributeValue: string | null): boolean;
} {
    const parsers = Object.fromEntries(
        configs.map(config => {
            const { name, type } = config;
            let parser: AttributeParser;

            if (type === "boolean") {
                parser = createBooleanParser(config.defaultValue ?? true);
            } else if (type === "enum") {
                parser = createEnumParser(config);
            } else if (type === "number") {
                parser = createNumberParser(config);
            } else {
                throw new Error(`Unknown attribute type: ${(config as any).type}`);
            }

            return [name, parser];
        })
    ) as Record<T[number]["name"], AttributeParser>;

    // Create attribute -> property mapping
    const propertyMapping = Object.fromEntries(configs.map(config => [config.name, camelCase(config.name)]));

    return {
        ...parsers,
        getObservedAttributes: () => configs.map(config => config.name),
        getPropertyMapping: () => propertyMapping,
        updateProperty: (element: any, attributeName: string, attributeValue: string | null): boolean => {
            const parser = parsers[attributeName as keyof typeof parsers];
            if (!parser) return false;

            const propertyName = propertyMapping[attributeName];
            if (!propertyName) return false;

            element[propertyName] = parser(attributeValue);
            return true;
        },
    };
}

// Legacy helper function to create typed attribute parsers
export function createAttributeParsers<T extends Record<string, AttributeParser>>(
    parsers: T
): T & { getObservedAttributes(): string[] } {
    return {
        ...parsers,
        getObservedAttributes: () => Object.keys(parsers),
    };
}
