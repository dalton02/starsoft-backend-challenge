import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  BadRequestException,
  HttpException,
} from '@nestjs/common';

import { AppError } from './app-errors';
import { QueryFailedError } from 'typeorm';

@Catch(Error)
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro inesperado ocorreu';

    // Tratamento de erros customizados da aplicação
    if (exception instanceof AppError) {
      const httpError = exception.toHTTPResponse();
      status = httpError.getStatus();
      message = httpError.message;
    }

    if (exception.message.includes('Transaction failed')) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Falha na transação do banco de dados.';
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      const response = exception.getResponse();

      // Verifica se a resposta é um objeto e tem a propriedade 'message'
      if (typeof response === 'object' && 'message' in response) {
        const details = response as { message: any };

        // Se 'message' for um array, junta em uma string, caso contrário, usa diretamente
        if (Array.isArray(details.message)) {
          message = details.message.join(', ');
        } else {
          message = details.message;
        }
      } else {
        // Se não for um objeto com a propriedade 'message', converte todo o objeto para string
        message = JSON.stringify(response);
      }
    }

    // Assegura que a mensagem seja uma string, caso a exceção traga um objeto como resposta
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    console.error(
      `\x1b[31m(${exception.constructor.name}) -> Error ${status}:\x1b[37m ${message}\x1b[33m ${request.method} ${request.url}`,
    );
    console.error(exception);

    response.status(status).json({
      message: message,
      statusCode: status,
      data: null,
    });
  }
}
