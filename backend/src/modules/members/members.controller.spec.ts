import { Response } from 'express';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  const mockMembersService = {
    getAll: jest.fn(),
    downloadPortfolioPdf: jest.fn(),
  } as unknown as MembersService;

  let controller: MembersController;

  beforeEach(() => {
    controller = new MembersController(mockMembersService);
    jest.clearAllMocks();
  });

  it('should write PDF response headers and body on download', async () => {
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
});
