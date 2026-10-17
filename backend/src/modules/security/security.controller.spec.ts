import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from './security.controller';
import { SecurityModule } from './security.module';
import { SecurityService } from './security.service';

describe('security overview endpoint', () => {
  let module: TestingModule;
  let controller: SecurityController;
  const snapshot = jest.fn();

  beforeEach(async () => {
    snapshot.mockReset().mockResolvedValue({ configured: false });
    module = await Test.createTestingModule({
      imports: [ConfigModule, SecurityModule],
    })
      .overrideProvider(SecurityService)
      .useValue({ snapshot })
      .compile();
    controller = module.get(SecurityController);
  });

  afterEach(async () => module.close());

  it.each(['all', 'ids', 'firewall'])(
    'accepts the %s read filter',
    async (source) => {
      await expect(controller.getOverview(source)).resolves.toEqual({
        configured: false,
      });
      expect(snapshot).toHaveBeenCalledWith(source);
    },
  );

  it('defaults to all sources and rejects unexpected query values', async () => {
    await controller.getOverview();
    expect(snapshot).toHaveBeenCalledWith('all');
    snapshot.mockClear();
    expect(() => controller.getOverview('admin')).toThrow(BadRequestException);
    expect(snapshot).not.toHaveBeenCalled();
  });
});
