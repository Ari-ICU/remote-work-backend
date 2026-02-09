import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        console.error('--- GLOBAL EXCEPTION caught ---');
        console.error(exception);
        if (exception instanceof Error) {
            console.error('Stack trace:', exception.stack);
        }
        console.error('--------------------------------');

        let message = 'Internal server error';
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            message = typeof response === 'object' && response !== null && 'message' in response
                ? (response as any).message
                : exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: message,
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
