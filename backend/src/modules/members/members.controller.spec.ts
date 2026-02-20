import { Response } from 'express';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  const mockMembersService = {
    getAll: jest.fn(),
    downloadPortfolioPdf: jest.fn(),
    startPortfolioPdfJob: jest.fn(),
    getPortfolioPdfJobStatus: jest.fn(),
    downloadPortfolioPdfByJob: jest.fn(),
  } as unknown as MembersService;

  let controller: MembersController;

  beforeEach(() => {
    controller = new MembersController(mockMembersService);
    jest.clearAllMocks();
  });

  it('should write PDF response headers and body on direct download', async () => {
    const responseMock = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    (mockMembersService.downloadPortfolioPdf as jest.Mock).mockResolvedValue({
      fileName: 'seongwon-portfolio.pdf',
      contentType: 'application/pdf',
      content: Buffer.from('pdf-data'),
    });

    await controller.downloadPortfolioPdf('seongwon', responseMock);

    expect(mockMembersService.downloadPortfolioPdf).toHaveBeenCalledWith(
      'seongwon',
    );
    expect(responseMock.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf',
    );
    expect(responseMock.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="seongwon-portfolio.pdf"',
    );
    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(responseMock.send).toHaveBeenCalledWith(Buffer.from('pdf-data'));
  });

  it('should return queued status when job starts', async () => {
    (mockMembersService.startPortfolioPdfJob as jest.Mock).mockResolvedValue({
      jobId: 'job-1',
      status: 'queued',
      message: 'queued',
      createdAt: '2026-02-20T00:00:00.000Z',
      updatedAt: '2026-02-20T00:00:00.000Z',
    });

    const result = await controller.startPortfolioPdfJob('seongwon');

    expect(mockMembersService.startPortfolioPdfJob).toHaveBeenCalledWith(
      'seongwon',
    );
    expect(result.status).toBe('queued');
  });

  it('should return job status', async () => {
    (
      mockMembersService.getPortfolioPdfJobStatus as jest.Mock
    ).mockResolvedValue({
      jobId: 'job-1',
      status: 'running',
      message: 'running',
      createdAt: '2026-02-20T00:00:00.000Z',
      updatedAt: '2026-02-20T00:00:01.000Z',
    });

    const result = await controller.getPortfolioPdfJobStatus('job-1');

    expect(mockMembersService.getPortfolioPdfJobStatus).toHaveBeenCalledWith(
      'job-1',
    );
    expect(result.status).toBe('running');
  });

  it('should write PDF response headers and body when downloading by job', async () => {
    const responseMock = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    (
      mockMembersService.downloadPortfolioPdfByJob as jest.Mock
    ).mockResolvedValue({
      fileName: 'seongwon-portfolio.pdf',
      contentType: 'application/pdf',
      content: Buffer.from('pdf-data'),
    });

    await controller.downloadPortfolioPdfByJob('job-1', responseMock);

    expect(mockMembersService.downloadPortfolioPdfByJob).toHaveBeenCalledWith(
      'job-1',
    );
    expect(responseMock.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf',
    );
    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(responseMock.send).toHaveBeenCalledWith(Buffer.from('pdf-data'));
  });
});
