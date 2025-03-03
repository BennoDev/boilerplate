import { type ZodDtoStatic, createZodDto } from '@anatine/zod-nestjs';
import { extendZodWithOpenApi, type OpenApiZodAny } from '@anatine/zod-openapi';
// eslint-disable-next-line import/no-internal-modules
import { type SchemaObject } from 'openapi3-ts/oas31';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createZodDtoPatch = <Schema extends OpenApiZodAny>(
    schema: Schema,
): ZodDtoStatic<Schema> => {
    const openApiTitle = (schema.metaOpenApi as SchemaObject)?.title;
    if (!openApiTitle) {
        throw new Error('Title is required');
    }

    const zodDto = createZodDto(schema);
    Object.defineProperty(zodDto, 'name', { value: openApiTitle });

    return zodDto;
};
