import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function Doc(params: {
  name: string;
  description?: string;
  statusCode?: HttpStatus;
  response?: Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type
  isArray?: boolean;
  hasAuth?: boolean;
  isDeprecated?: boolean;
}) {
  const statusCode = params.statusCode ?? HttpStatus.OK;
  const hasAuth = params.hasAuth ?? true;
  const isDeprecated = params.isDeprecated ?? false;

  const decorators = [
    ApiOperation({
      summary: params.name,
      description: params.description,
      deprecated: isDeprecated,
    }),
    HttpCode(statusCode),
  ];

  if (hasAuth) {
    decorators.push(ApiBearerAuth());
  }

  const errorsResponse = [
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Erros por requisição, incluem status codes 40*, por exemplo: 401 para sem permissão, 403 para acesso negado, 404 para recurso não encontrado, 409 para conflito',
      schema: {
        properties: {
          statusCode: {
            enum: [
              HttpStatus.BAD_REQUEST,
              HttpStatus.UNAUTHORIZED,
              HttpStatus.FORBIDDEN,
              HttpStatus.NOT_FOUND,
              HttpStatus.METHOD_NOT_ALLOWED,
              HttpStatus.CONFLICT,
              HttpStatus.UNPROCESSABLE_ENTITY,
              HttpStatus.TOO_MANY_REQUESTS,
            ],
            example: HttpStatus.BAD_REQUEST,
          },
          message: {
            type: 'string',
            example: 'Requisição inválida',
          },
          data: { type: 'any', example: null },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description:
        'Erro interno do servidor, incluem status codes 50*, por exemplo: 500 para erro genérico, 503 para serviço indisponível',
      schema: {
        properties: {
          statusCode: {
            type: 'number',
            example: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          message: {
            type: 'string',
            example: 'Erro interno do servidor',
          },
          data: {
            enum: [
              HttpStatus.INTERNAL_SERVER_ERROR,
              HttpStatus.NOT_IMPLEMENTED,
              HttpStatus.BAD_GATEWAY,
              HttpStatus.SERVICE_UNAVAILABLE,
              HttpStatus.GATEWAY_TIMEOUT,
            ],
            example: HttpStatus.INTERNAL_SERVER_ERROR,
          },
        },
      },
    }),
  ];

  // Se não for passado uma resposta, então a resposta será um objeto genérico
  if (!params.response) {
    decorators.push(
      ApiResponse({
        status: statusCode,
        description: 'Operação realizada com sucesso',
        schema: {
          properties: {
            statusCode: { type: 'number', example: statusCode },
            message: {
              type: 'string',
              example: 'Operação realizada com sucesso',
            },
            data: { type: 'any', example: null },
          },
        },
      }),
      ...errorsResponse,
    );
    return applyDecorators(...decorators);
  }

  // Registra os modelos para que o Swagger consiga tratar
  decorators.push(
    ApiExtraModels(params.response),
    ApiResponse({
      status: statusCode,
      description: 'Operação realizada com sucesso',
      schema: {
        allOf: [
          {
            properties: {
              statusCode: { type: 'number', example: statusCode },
              message: {
                type: 'string',
                example: 'Operação realizada com sucesso',
              },
              data: params.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(params.response) },
                  }
                : {
                    $ref: getSchemaPath(params.response),
                  },
            },
          },
        ],
      },
    }),
    ...errorsResponse,
  );

  return applyDecorators(...decorators);
}
