import { api } from '@opentelemetry/sdk-node';

type AnyFunction = (...args: any[]) => unknown;

type TraceDecoratorOptions = {
    /**
     * Defaults to `${className.methodName}`
     */
    name?: string;
    /**
     * Whether to include the arguments in the span attributes
     * Defaults to `true`
     */
    includeArgsInAttributes?: boolean;
    /**
     * Additional attributes to add to the span
     */
    attributes?: api.Attributes;
};

export const Trace: (options?: TraceDecoratorOptions) => MethodDecorator =
    (options = {}) =>
    (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value as AnyFunction;

        const tracer = api.trace.getTracer(process.env['SERVICE_NAME']!);

        const defaultOptions: Required<TraceDecoratorOptions> = {
            includeArgsInAttributes: true,
            attributes: {},
            name: `${target.constructor.name}.${propertyKey.toString()}`,
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
        };

        if (!descriptor.value) {
            throw new Error(
                'Descriptor value is not a defined, did you correctly apply the decorator?',
            );
        }

        (descriptor.value as AnyFunction) = function wrapped(
            this: unknown,
            ...args: any[]
        ): unknown {
            const attributes = mergedOptions.includeArgsInAttributes
                ? { ...mergedOptions.attributes, args }
                : mergedOptions.attributes;

            return tracer.startActiveSpan(
                mergedOptions.name,
                { attributes },
                async span => {
                    try {
                        return await originalMethod.apply(this, args);
                    } finally {
                        span.end();
                    }
                },
            );
        };
    };
