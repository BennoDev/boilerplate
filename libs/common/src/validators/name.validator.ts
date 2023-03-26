import {
    type ValidationOptions,
    registerDecorator,
    type ValidationArguments,
    type ValidatorConstraintInterface,
    ValidatorConstraint,
} from 'class-validator';

const validatorName = 'IsName';

export const IsName =
    (validationOptions?: ValidationOptions) =>
    (object: object, propertyName: string): void => {
        registerDecorator({
            name: validatorName,
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsNameConstraint,
        });
    };

@ValidatorConstraint({ name: validatorName, async: false })
class IsNameConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean | Promise<boolean> {
        if (typeof value !== 'string') {
            return false;
        }

        const trimmedValue = value.trim();
        const isCorrectLength =
            trimmedValue.length > 1 && trimmedValue.length < 255;

        // Only allow alphanumeric characters, dashes, and spaces
        const nameRegex =
            /^[\w'\-,.][^(0-9_!,¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\])]{1,}$/;
        return isCorrectLength && nameRegex.test(value);
    }

    defaultMessage?(validationArguments: ValidationArguments): string {
        /**
         * Allowed in this context as we are truly dealing with "any" here,
         * and the worst case is that it would print "[object Object] is not a proper ..." which is valid information for validation purposes.
         */
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `${validationArguments.value} is not a proper name, must be between 1 and 255 characters and can only contain alphanumeric characters, spaces and dashes`;
    }
}
