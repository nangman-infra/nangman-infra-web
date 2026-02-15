export class MonitoringOperationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: string,
  ) {
    super(message);
    this.name = MonitoringOperationError.name;
  }
}
