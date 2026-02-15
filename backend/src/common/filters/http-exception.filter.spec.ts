import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const status = jest.fn();
  const json = jest.fn();
  const getResponse = jest.fn();
  const getRequest = jest.fn();
  const switchToHttp = jest.fn();

  let filter: HttpExceptionFilter;
  let host: ArgumentsHost;

  beforeEach(() => {
    status.mockReturnValue({ json });
    getResponse.mockReturnValue({ status });
    getRequest.mockReturnValue({
      method: 'POST',
      url: '/api/v1/contact',
      ip: '127.0.0.1',
      get: jest.fn(),
    });
    switchToHttp.mockReturnValue({
      getResponse,
      getRequest,
    });

    host = { switchToHttp } as unknown as ArgumentsHost;
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  it('should handle HttpException responses', () => {
    const exception = new HttpException('bad request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/api/v1/contact',
        message: 'bad request',
      }),
    );
  });

  it('should handle statusCode based application errors', () => {
    const exception = {
      statusCode: HttpStatus.BAD_GATEWAY,
      message: 'webhook failed',
    };

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_GATEWAY,
        path: '/api/v1/contact',
        message: 'webhook failed',
      }),
    );
  });
});
