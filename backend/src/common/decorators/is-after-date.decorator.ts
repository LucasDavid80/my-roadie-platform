import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If either value is missing, skip cross-validation
          // (Missing required fields will be caught by their own @IsNotEmpty decorators)
          if (!value || !relatedValue) {
            return true;
          }

          const date = new Date(value);
          const relatedDate = new Date(relatedValue);

          // Both must be valid dates to compare
          if (isNaN(date.getTime()) || isNaN(relatedDate.getTime())) {
            return false;
          }

          return date > relatedDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be strictly after ${relatedPropertyName}`;
        },
      },
    });
  };
}
