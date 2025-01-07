// Define a limited depth for the recursive type
type Primitive = string | number | boolean | null | undefined;
type ClassArray = Array<Primitive | Record<string, boolean>>;

// Now ClassValue has a clear, finite type structure
type ClassValue = Primitive | Record<string, boolean> | ClassArray;

export function classNames(...classes: ClassValue[]): string {
    return classes
        .flat(1) // Only flatten one level to avoid excessive recursion
        .filter(Boolean) // Remove falsy values
        .map(value => {
            if (typeof value === 'string') return value;
            if (typeof value === 'object' && value !== null) {
                return Object.entries(value)
                    .filter(([_, enabled]) => enabled)
                    .map(([className]) => className)
                    .join(' ');
            }
            return '';
        })
        .filter(Boolean)
        .join(' ');
}