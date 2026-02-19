import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MemberProfile } from '../../domain/member-profile';
import {
  MEMBER_READER,
  MemberReaderPort,
} from '../../domain/ports/member-reader.port';
import {
  MEMBER_PORTFOLIO_RENDERER,
  MemberPortfolioRendererPort,
} from '../../domain/ports/member-portfolio-renderer.port';
import { MemberPortfolioDocument } from '../../domain/models/member-portfolio-document.model';

const PORTFOLIO_CONTENT_TYPE = 'application/pdf';

@Injectable()
export class DownloadMemberPortfolioPdfUseCase {
  constructor(
    @Inject(MEMBER_READER)
    private readonly memberReader: MemberReaderPort,
    @Inject(MEMBER_PORTFOLIO_RENDERER)
    private readonly memberPortfolioRenderer: MemberPortfolioRendererPort,
  ) {}

  async execute(slug: string): Promise<MemberPortfolioDocument> {
    const normalizedIdentifier = this.normalizeSlug(slug);
    if (!normalizedIdentifier) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    const members = await this.memberReader.readAll();
    const member = this.findMemberByIdentifier(members, normalizedIdentifier);

    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    const content = await this.memberPortfolioRenderer.render(member);
    const preferredFileNameBase = this.getPreferredFileNameBase(
      member,
      normalizedIdentifier,
    );

    return {
      fileName: `${this.toSafeFileName(preferredFileNameBase)}-portfolio.pdf`,
      contentType: PORTFOLIO_CONTENT_TYPE,
      content,
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
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-가-힣]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getPreferredFileNameBase(
    member: MemberProfile,
    normalizedIdentifier: string,
  ): string {
    if (this.hasAsciiWord(normalizedIdentifier)) {
      return normalizedIdentifier;
    }

    const aliases = Array.from(this.collectAliases(member));
    const asciiAlias = aliases.find((alias) => this.hasAsciiWord(alias));
    if (asciiAlias) {
      return asciiAlias;
    }

    return 'member';
  }

  private hasAsciiWord(value: string): boolean {
    return /[a-z0-9]/i.test(value);
  }

  private toSafeFileName(value: string): string {
    const safeName = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-_.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return safeName || 'member';
  }
}
