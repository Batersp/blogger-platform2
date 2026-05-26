import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseBody } from './error-response-body.type';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Все ошибки
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    //Если сработал этот фильтр, то пользователю улетит 500я ошибка
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const message = exception.message || 'Unknown exception occurred.';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const status = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(message);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(message: string): ErrorResponseBody {
    //TODO: Replace with getter from configService. will be in the following lessons
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        errorsMessages: [
          {
            message: 'Some error occurred',
            field: '',
          },
        ],
      };
    }

    return {
      errorsMessages: [
        {
          message,
          field: '',
        },
      ],
    };
  }
}
