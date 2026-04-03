import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { MemberProfile } from '../../domain/member-profile';
import { MemberNotFoundError } from '../../domain/errors/member-portfolio.error';
import { MemberPortfolioTarget } from '../../domain/models/member-portfolio-target.model';
import {
  MEMBER_READER,
  MemberReaderPort,
} from '../../domain/ports/member-reader.port';

@Injectable()
export class ResolveMemberPortfolioTargetUseCase {
  constructor(
    @Inject(MEMBER_READER)
    private readonly memberReader: MemberReaderPort,
  ) {}

  async execute(slug: string): Promise<MemberPortfolioTarget> {
    const normalizedIdentifier = this.normalizeSlug(slug);
    if (!normalizedIdentifier) {
      throw new MemberNotFoundError();
    }

    const members = await this.memberReader.readAll();
    const member = this.findMemberByIdentifier(members, normalizedIdentifier);

    if (!member) {
      throw new MemberNotFoundError();
    }

    const safeFileNameBase = this.toSafeFileName(member.slug);
    const memberFingerprint = this.createMemberFingerprint(member);

    return {
      member,
      fileName: `${safeFileNameBase}-portfolio.pdf`,
      cacheKey: `${safeFileNameBase}:${memberFingerprint}`,
    };
  }

  private findMemberByIdentifier(
    members: MemberProfile[],
    normalizedIdentifier: string,
  ): MemberProfile | null {
    for (const member of members) {
      const aliases = this.collectAliases(member);
      if (aliases.has(normalizedIdentifier)) {
        return member;
      }
    }

    return null;
  }

  private collectAliases(member: MemberProfile): Set<string> {
    const aliases = new Set<string>();

    aliases.add(this.normalizeSlug(member.slug));
    aliases.add(this.normalizeSlug(member.name));

    if (member.links?.homepage) {
      const homepageAlias = this.extractDomainAlias(member.links.homepage);
      if (homepageAlias) {
        aliases.add(this.normalizeSlug(homepageAlias));
      }
    }

    if (member.links?.resume) {
      const resumeAlias = this.extractResumeAlias(member.links.resume);
      if (resumeAlias) {
        aliases.add(this.normalizeSlug(resumeAlias));
      }
    }

    return new Set(Array.from(aliases).filter((alias) => alias.length > 0));
  }

  private extractDomainAlias(value: string): string | null {
    try {
      const parsed = new URL(value);
      const [subdomain] = parsed.hostname.split('.');
      if (!subdomain || subdomain === 'www') {
        return null;
      }

      return subdomain;
    } catch {
      return null;
    }
  }

  private extractResumeAlias(value: string): string | null {
    const fileName = value.split('/').pop()?.trim();
    if (!fileName) {
      return null;
    }

    const baseName = fileName.replace(/\.[^.]+$/, '');
    if (!baseName) {
      return null;
    }

    return baseName.replace(/-(resume|cv)$/i, '');
  }

  private normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, '-')
      .replaceAll(/[^a-z0-9\-가-힣]/g, '')
      .replaceAll(/-+/g, '-')
      .replaceAll(/(^-)|(-$)/g, '');
  }

  private toSafeFileName(value: string): string {
    const safeName = value
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9\-_.]/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/(^-)|(-$)/g, '');

    return safeName || 'member';
  }

  private createMemberFingerprint(member: MemberProfile): string {
    const serialized = JSON.stringify(member);
    return createHash('sha256').update(serialized).digest('hex');
  }
}
