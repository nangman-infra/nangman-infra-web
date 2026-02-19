import { Injectable } from '@nestjs/common';
import { GetAllNoticesUseCase } from './application/use-cases/get-all-notices.use-case';
import { Notice } from './domain/notice';

@Injectable()
export class NoticesService {
  constructor(private readonly getAllNoticesUseCase: GetAllNoticesUseCase) {}

  async getAll(): Promise<Notice[]> {
    return this.getAllNoticesUseCase.execute();
  }
}
