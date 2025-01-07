type ClassValue = string | undefined | null | false | Record<string, boolean> | ClassValue[];

export function classNames(...classes: ClassValue[]): string {
    return classes
        .flat(Infinity) // Flatten nested arrays
        .filter((cls): cls is string => typeof cls === 'string' && !!cls) // Filter valid strings
        .join(' '); // Join with space
}
