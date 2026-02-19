import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  MemberCategory,
  MemberCertification,
  MemberEducation,
  MemberLinks,
  MemberMentoring,
  MemberProfile,
  MemberProject,
  MemberTechnicalSkillGroup,
  MemberWorkExperience,
} from '../../domain/member-profile';
import { MemberReaderPort } from '../../domain/ports/member-reader.port';

interface DirectusItemsResponse {
  data?: unknown;
}

interface DirectusAuthLoginResponse {
  data?: {
    access_token?: string;
  };
}

@Injectable()
export class DirectusMembersReaderAdapter implements MemberReaderPort {
  private readonly logger = new Logger(DirectusMembersReaderAdapter.name);
  private readonly membersPath = '/items/members';
  private readonly timeoutMs = 8000;

  constructor(private readonly configService: ConfigService) {}

  async readAll(): Promise<MemberProfile[]> {
    const baseUrl = this.getConfigValue('DIRECTUS_URL', 'Directus URL');
    const configuredToken = this.configService.get<string>('DIRECTUS_TOKEN');
    let token = configuredToken?.trim() || null;

    let response: { data: DirectusItemsResponse };

    try {
      response = await this.fetchMembers(baseUrl, token);
    } catch (error) {
      if (!this.isAuthError(error)) {
        throw error;
      }

      token = await this.loginAndGetToken(baseUrl);
      response = await this.fetchMembers(baseUrl, token);
    }

    const members = this.parseMembers(response.data?.data);
    this.logger.log(`Fetched ${members.length} members from Directus`);

    return members;
  }

  private async fetchMembers(
    baseUrl: string,
    token: string | null,
  ): Promise<{ data: DirectusItemsResponse }> {
    return axios.get<DirectusItemsResponse>(`${baseUrl}${this.membersPath}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/json',
      },
      params: {
        limit: -1,
        sort: 'name',
      },
      timeout: this.timeoutMs,
    });
  }

  private async loginAndGetToken(baseUrl: string): Promise<string> {
    const email = this.getConfigValue('DIRECTUS_EMAIL', 'Directus Email');
    const password = this.getConfigValue(
      'DIRECTUS_PASSWORD',
      'Directus Password',
    );

    const response = await axios.post<DirectusAuthLoginResponse>(
      `${baseUrl}/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: this.timeoutMs,
      },
    );

    const token = response.data?.data?.access_token?.trim();
    if (!token) {
      throw new Error('Directus 로그인 토큰을 가져오지 못했습니다.');
    }

    return token;
  }

  private isAuthError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false;
    }

    return error.response?.status === 401 || error.response?.status === 403;
  }

  private getConfigValue(key: string, label: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      this.logger.error(`${label} is not configured`, { key });
      throw new Error(`${label}이(가) 설정되지 않았습니다.`);
    }

    return value;
  }

  private parseMembers(payload: unknown): MemberProfile[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((item) => this.normalizeMember(item))
      .filter((item): item is MemberProfile => item !== null);
  }

  private normalizeMember(payload: unknown): MemberProfile | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const item = payload as Record<string, unknown>;

    const name = this.toOptionalString(item.name);
    const role = this.toOptionalString(item.role);
    if (!name || !role) {
      return null;
    }

    const slug = this.toOptionalString(item.slug) ?? this.toSlug(name);
    const affiliation = this.toOptionalString(item.affiliation);
    const experience = this.toOptionalString(item.experience);
    const bio = this.toOptionalString(item.bio);
    const profileImage = this.toOptionalString(item.profileImage);

    const member: MemberProfile = {
      slug,
      name,
      role,
      category: this.toCategory(item.category),
      ...(affiliation && { affiliation }),
      ...(experience && { experience }),
      ...(bio && { bio }),
      ...(profileImage && { profileImage }),
    };

    const specialties = this.toStringArray(item.specialties);
    if (specialties.length > 0) {
      member.specialties = specialties;
    }

    const achievements = this.toStringArray(item.achievements);
    if (achievements.length > 0) {
      member.achievements = achievements;
    }

    const education = this.toEducationArray(item.education);
    if (education.length > 0) {
      member.education = education;
    }

    const workExperience = this.toWorkExperienceArray(item.workExperience);
    if (workExperience.length > 0) {
      member.workExperience = workExperience;
    }

    const certifications = this.toCertifications(item.certifications);
    if (certifications.length > 0) {
      member.certifications = certifications;
    }

    const projects = this.toProjects(item.projects);
    if (projects.length > 0) {
      member.projects = projects;
    }

    const technicalSkills = this.toTechnicalSkillGroups(item.technicalSkills);
    if (technicalSkills.length > 0) {
      member.technicalSkills = technicalSkills;
    }

    const mentoring = this.toMentoring(item.mentoring);
    if (mentoring) {
      member.mentoring = mentoring;
    }

    const links = this.toLinks(item.links);
    if (links) {
      member.links = links;
    }

    return member;
  }

  private toCategory(value: unknown): MemberCategory {
    if (value === 'senior') {
      return 'senior';
    }

    // Backward compatibility: existing CMS rows may still keep legacy "student".
    if (value === 'student' || value === 'mentee') {
      return 'mentee';
    }

    return 'mentee';
  }

  private toOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-가-힣]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private toArray(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  private toRecord(value: unknown): Record<string, unknown> | null {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  private toStringArray(value: unknown): string[] {
    return this.toArray(value)
      .map((item) => this.toOptionalString(item))
      .filter((item): item is string => item !== null);
  }

  private toEducationArray(value: unknown): MemberEducation[] {
    return this.toArray(value)
      .map((item) => this.toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => {
        const degree = this.toOptionalString(item.degree);
        const major = this.toOptionalString(item.major);
        const university = this.toOptionalString(item.university);

        if (!degree || !major || !university) {
          return null;
        }

        const papers = this.toArray(item.papers)
          .map((paperItem) => this.toRecord(paperItem))
          .filter(
            (paperItem): paperItem is Record<string, unknown> =>
              paperItem !== null,
          )
          .map((paperItem) => {
            const title = this.toOptionalString(paperItem.title);
            const type = this.toOptionalString(paperItem.type);
            const date = this.toOptionalString(paperItem.date);

            if (!title || !type || !date) {
              return null;
            }

            return {
              title,
              type,
              date,
              ...(this.toOptionalString(paperItem.authors) && {
                authors: this.toOptionalString(paperItem.authors),
              }),
            };
          })
          .filter(
            (
              paper,
            ): paper is {
              title: string;
              type: string;
              date: string;
              authors?: string;
            } => paper !== null,
          );

        return {
          degree,
          major,
          university,
          ...(this.toOptionalString(item.period) && {
            period: this.toOptionalString(item.period),
          }),
          ...(this.toOptionalString(item.thesis) && {
            thesis: this.toOptionalString(item.thesis),
          }),
          ...(this.toOptionalString(item.lab) && {
            lab: this.toOptionalString(item.lab),
          }),
          ...(this.toOptionalString(item.description) && {
            description: this.toOptionalString(item.description),
          }),
          ...(papers.length > 0 && { papers }),
        };
      })
      .filter((item): item is MemberEducation => item !== null);
  }

  private toWorkExperienceArray(value: unknown): MemberWorkExperience[] {
    return this.toArray(value)
      .map((item) => this.toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => {
        const company = this.toOptionalString(item.company);
        const position = this.toOptionalString(item.position);
        const period = this.toOptionalString(item.period);

        if (!company || !position || !period) {
          return null;
        }

        const description = this.toStringArray(item.description);
        return {
          company,
          position,
          period,
          description,
        };
      })
      .filter((item): item is MemberWorkExperience => item !== null);
  }

  private toCertifications(value: unknown): MemberCertification[] {
    return this.toArray(value)
      .map((item) => this.toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => {
        const name = this.toOptionalString(item.name);
        const issuer = this.toOptionalString(item.issuer);

        if (!name || !issuer) {
          return null;
        }

        return {
          name,
          issuer,
          ...(this.toOptionalString(item.date) && {
            date: this.toOptionalString(item.date),
          }),
        };
      })
      .filter((item): item is MemberCertification => item !== null);
  }

  private toProjects(value: unknown): MemberProject[] {
    return this.toArray(value)
      .map((item) => this.toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => {
        const title = this.toOptionalString(item.title);
        const description = this.toOptionalString(item.description);

        if (!title || !description) {
          return null;
        }

        return {
          title,
          description,
          technologies: this.toStringArray(item.technologies),
          ...(this.toOptionalString(item.industry) && {
            industry: this.toOptionalString(item.industry),
          }),
        };
      })
      .filter((item): item is MemberProject => item !== null);
  }

  private toTechnicalSkillGroups(value: unknown): MemberTechnicalSkillGroup[] {
    return this.toArray(value)
      .map((item) => this.toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => {
        const category = this.toOptionalString(item.category);
        if (!category) {
          return null;
        }

        return {
          category,
          skills: this.toStringArray(item.skills),
        };
      })
      .filter((item): item is MemberTechnicalSkillGroup => item !== null);
  }

  private toMentoring(value: unknown): MemberMentoring | null {
    const record = this.toRecord(value);
    if (!record) {
      return null;
    }

    const count =
      typeof record.count === 'number' ? record.count : Number(record.count);

    const description = this.toOptionalString(record.description);
    if (!Number.isFinite(count) || !description) {
      return null;
    }

    return {
      count,
      description,
    };
  }

  private toLinks(value: unknown): MemberLinks | null {
    const record = this.toRecord(value);
    if (!record) {
      return null;
    }

    const blog = this.toOptionalString(record.blog);
    const homepage = this.toOptionalString(record.homepage);
    const resume = this.toOptionalString(record.resume);

    const links: MemberLinks = {
      ...(blog && { blog }),
      ...(homepage && { homepage }),
      ...(resume && { resume }),
    };

    return Object.keys(links).length > 0 ? links : null;
  }
}
