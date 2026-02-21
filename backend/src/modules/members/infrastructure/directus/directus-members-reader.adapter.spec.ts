import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DirectusMembersReaderAdapter } from './directus-members-reader.adapter';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createAdapter(): DirectusMembersReaderAdapter {
  const configService = new ConfigService({
    DIRECTUS_URL: 'https://directus.console.nangman.cloud',
    DIRECTUS_TOKEN: 'test-token',
    FRONTEND_URL: 'https://nangman.cloud',
  });

  return new DirectusMembersReaderAdapter(configService);
}

function mockDirectusMembers(profileImage: unknown): void {
  mockedAxios.get.mockResolvedValueOnce({
    data: {
      data: [
        {
          slug: 'seongwon',
          name: '이성원',
          role: 'Mentor',
          category: 'senior',
          profileImage,
        },
      ],
    },
  } as never);
}

describe('DirectusMembersReaderAdapter profile image normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes legacy /profile path to /profiles', async () => {
    const adapter = createAdapter();
    mockDirectusMembers('/profile/seongwon.png');

    const members = await adapter.readAll();

    expect(members).toHaveLength(1);
    expect(members[0]?.profileImage).toBe('/profiles/seongwon.png');
  });

  it('normalizes absolute frontend profile URL to local /profiles path', async () => {
    const adapter = createAdapter();
    mockDirectusMembers('https://nangman.cloud/profile/seongwon.png');

    const members = await adapter.readAll();

    expect(members).toHaveLength(1);
    expect(members[0]?.profileImage).toBe('/profiles/seongwon.png');
  });

  it('drops non-profile image paths such as directus assets path', async () => {
    const adapter = createAdapter();
    mockDirectusMembers('/assets/4ba8a0f1-acde-4f06-b94e-5cadbf5f03f5');

    const members = await adapter.readAll();

    expect(members).toHaveLength(1);
    expect(members[0]?.profileImage).toBeUndefined();
  });

  it('drops unsupported profile image values', async () => {
    const adapter = createAdapter();
    mockDirectusMembers('javascript:alert(1)');

    const members = await adapter.readAll();

    expect(members).toHaveLength(1);
    expect(members[0]?.profileImage).toBeUndefined();
  });
});
