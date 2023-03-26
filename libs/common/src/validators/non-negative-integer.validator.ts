import {
    type ValidatorConstraintInterface,
    ValidatorConstraint,
    type ValidationArguments,
    type ValidationOptions,
    registerDecorator,
} from 'class-validator';

const validatorName = 'NonNegativeInteger';

export const IsNonNegativeInteger =
    (validationOptions?: ValidationOptions) =>
    (object: object, propertyName: string): void => {
        registerDecorator({
            name: validatorName,
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsNonNegativeIntegerConstraint,
        });
    };

@ValidatorConstraint({ name: validatorName })
class IsNonNegativeIntegerConstraint implements ValidatorConstraintInterface {
    validate(value: number): boolean {
        if (typeof value !== 'number') {
            return false;
        }

        return value >= 0 && Number.isInteger(value);
    }

    defaultMessage?(validationArguments: ValidationArguments): string {
        /**
         * Allowed in this context as we are truly dealing with "any" here,
         * and the worst case is that it would print "[object Object] is not a proper ..." which is valid information for validation purposes.
         */
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `${validationArguments.value} is not a proper non-negative integer, must be 0 or larger and integer`;
    }
}
