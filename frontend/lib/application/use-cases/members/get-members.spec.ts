import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Member } from '@/types/member';
import { fetchMembersApi } from '@/lib/infrastructure/http/members-api-client';
import { getMembersUseCase } from './get-members';

vi.mock('@/lib/infrastructure/http/members-api-client', () => ({
  fetchMembersApi: vi.fn(),
}));

const mockedFetchMembersApi = vi.mocked(fetchMembersApi);

const fallbackMembers: Member[] = [
  {
    name: 'fallback-member',
    role: 'fallback-role',
    category: 'mentee',
  },
];

describe('getMembersUseCase', () => {
  beforeEach(() => {
    mockedFetchMembersApi.mockReset();
  });

  it('sanitizes mixed-type specialties and achievements without dropping member', async () => {
    mockedFetchMembersApi.mockResolvedValue({
      data: [
        {
          slug: 'member-a',
          name: 'member-a',
          role: 'role-a',
          category: 'student',
          specialties: ['AWS', 123, '', null],
          achievements: ['OPS', false, '  '],
        },
      ],
    });

    const result = await getMembersUseCase({ fallback: fallbackMembers });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      slug: 'member-a',
      name: 'member-a',
      role: 'role-a',
      category: 'mentee',
      specialties: ['AWS'],
      achievements: ['OPS'],
    });
  });

  it('returns fallback when payload has no valid member rows', async () => {
    mockedFetchMembersApi.mockResolvedValue({
      data: [{ category: 'mentee' }],
    });

    const result = await getMembersUseCase({ fallback: fallbackMembers });

    expect(result).toEqual(fallbackMembers);
  });
});
