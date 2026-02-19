import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  MemberCertification,
  MemberEducation,
  MemberProfile,
  MemberProject,
  MemberWorkExperience,
} from '../../domain/member-profile';
import { MemberPortfolioRendererPort } from '../../domain/ports/member-portfolio-renderer.port';

interface PageLayout {
  left: number;
  right: number;
  width: number;
  bottom: number;
}

interface SectionContext {
  cursorY: number;
  getLayout: () => PageLayout;
  ensureSpace: (currentY: number, height: number) => number;
}

@Injectable()
export class PdfMemberPortfolioRendererAdapter implements MemberPortfolioRendererPort {
  private readonly colors = {
    brand: '#0f3b82',
    brandLight: '#e8f0fd',
    textStrong: '#0f172a',
    textBody: '#1f2937',
    textMuted: '#475569',
    textSubtle: '#64748b',
    border: '#dbe3ee',
    surface: '#f8fafc',
    white: '#ffffff',
    accent: '#0b8f7a',
  };

  private readonly regularFontPath = join(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'noto-sans-kr',
    'files',
    'noto-sans-kr-korean-400-normal.woff',
  );

  private readonly boldFontPath = join(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'noto-sans-kr',
    'files',
    'noto-sans-kr-korean-700-normal.woff',
  );

  private readonly useCustomFont =
    existsSync(this.regularFontPath) && existsSync(this.boldFontPath);

  async render(member: MemberProfile): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        margins: {
          top: 42,
          right: 44,
          bottom: 42,
          left: 44,
        },
        info: {
          Title: `${member.name} Portfolio`,
          Author: 'Nangman Infra',
          Subject: 'Member Portfolio',
          Keywords: 'portfolio, member, infrastructure',
        },
      });

      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', (error: Error) => reject(error));
      document.on('end', () => resolve(Buffer.concat(chunks)));

      let layout = this.getLayout(document);
      const getLayout = (): PageLayout => layout;

      const ensureSpace = (currentY: number, height: number): number => {
        if (currentY + height <= layout.bottom) {
          return currentY;
        }

        document.addPage();
        layout = this.getLayout(document);
        this.drawContinuationHeader(document, member, layout);

        return document.page.margins.top + 24;
      };

      let cursorY = this.drawHeroSection(document, member, layout);

      cursorY = this.drawCareerHighlightSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      cursorY = this.drawSummarySection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      cursorY = this.drawSkillsSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      cursorY = this.drawWorkExperienceSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      cursorY = this.drawProjectsSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      cursorY = this.drawCertificationSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      cursorY = this.drawEducationSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      this.drawLinksSection(document, member, {
        cursorY,
        getLayout,
        ensureSpace,
      });

      document.end();
    });
  }

  private getLayout(document: PDFKit.PDFDocument): PageLayout {
    return {
      left: document.page.margins.left,
      right: document.page.width - document.page.margins.right,
      width:
        document.page.width -
        document.page.margins.left -
        document.page.margins.right,
      bottom: document.page.height - document.page.margins.bottom,
    };
  }

  private drawHeroSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    layout: PageLayout,
  ): number {
    const heroHeight = 126;
    const heroY = document.page.margins.top;

    document
      .save()
      .roundedRect(layout.left, heroY, layout.width, heroHeight, 12)
      .fill(this.colors.brand)
      .restore();

    const leftPadding = layout.left + 22;

    this.applyBoldFont(document);
    document
      .fontSize(25)
      .fillColor(this.colors.white)
      .text(member.name, leftPadding, heroY + 18, {
        width: layout.width - 44,
      });

    this.applyRegularFont(document);
    document
      .fontSize(12)
      .fillColor('#dbeafe')
      .text(member.role, leftPadding, document.y + 4, {
        width: layout.width - 44,
      });

    if (member.affiliation) {
      document
        .fontSize(10.5)
        .fillColor('#bfdbfe')
        .text(member.affiliation, leftPadding, document.y + 3, {
          width: layout.width - 44,
        });
    }

    const linkSummary = [member.links?.homepage, member.links?.blog]
      .filter((value): value is string => Boolean(value))
      .map((value) => this.shortenUrl(value))
      .join('  •  ');

    if (linkSummary) {
      this.applyRegularFont(document);
      document
        .fontSize(9.2)
        .fillColor('#e2e8f0')
        .text(linkSummary, leftPadding, heroY + 96, {
          width: layout.width - 44,
          ellipsis: true,
        });
    }

    return heroY + heroHeight + 16;
  }

  private drawContinuationHeader(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    layout: PageLayout,
  ): void {
    this.applyRegularFont(document);
    document
      .fontSize(8.8)
      .fillColor(this.colors.textSubtle)
      .text(
        `${member.name} Portfolio`,
        layout.left,
        document.page.margins.top - 12,
        {
          width: layout.width,
          align: 'right',
        },
      );

    document
      .save()
      .moveTo(layout.left, document.page.margins.top + 6)
      .lineTo(layout.right, document.page.margins.top + 6)
      .lineWidth(0.8)
      .strokeColor(this.colors.border)
      .stroke()
      .restore();
  }

  private drawCareerHighlightSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    let cursorY = context.ensureSpace(context.cursorY, 66);
    const layout = context.getLayout();

    const currentWork = member.workExperience?.[0];

    this.applyBoldFont(document);
    document
      .fontSize(10.8)
      .fillColor(this.colors.brand)
      .text('Career Highlight', layout.left, cursorY, {
        width: layout.width,
      });

    const lines: string[] = [];
    if (currentWork) {
      lines.push(`${currentWork.company} | ${currentWork.position}`);
      lines.push(currentWork.period);
    } else if (member.experience) {
      lines.push(member.experience);
    } else {
      lines.push('경력 정보가 등록되지 않았습니다.');
    }

    this.applyRegularFont(document);
    document
      .fontSize(10)
      .fillColor(this.colors.textBody)
      .text(lines.join('\n'), layout.left, document.y + 4, {
        width: layout.width,
        lineGap: 3,
      });

    cursorY = document.y + 12;
    return cursorY;
  }

  private drawSummarySection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    let cursorY = context.ensureSpace(context.cursorY, 86);
    const layout = context.getLayout();

    cursorY = this.drawSectionHeader(
      document,
      'Professional Summary',
      cursorY,
      layout,
    );

    const summaryContent = [member.experience, member.bio]
      .filter((value): value is string => Boolean(value))
      .join('\n\n')
      .trim();
    const summary =
      summaryContent || '멤버 프로필 요약 정보가 등록되지 않았습니다.';
    const textWidth = Math.min(layout.width - 24, 390);
    const summaryHeight = document.heightOfString(summary, {
      width: textWidth,
      lineGap: 5,
    });
    const cardHeight = summaryHeight + 22;

    cursorY = context.ensureSpace(cursorY, cardHeight + 12);

    document
      .save()
      .roundedRect(layout.left, cursorY, layout.width, cardHeight, 8)
      .fillAndStroke(this.colors.surface, this.colors.border)
      .restore();

    this.applyRegularFont(document);
    document
      .fontSize(10.2)
      .fillColor(this.colors.textBody)
      .text(summary, layout.left + 12, cursorY + 11, {
        width: textWidth,
        lineGap: 5,
      });

    return cursorY + cardHeight + 14;
  }

  private drawSkillsSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    const skills = this.collectSkills(member);

    let cursorY = context.ensureSpace(context.cursorY, 72);
    let layout = context.getLayout();
    cursorY = this.drawSectionHeader(
      document,
      'Core Competencies',
      cursorY,
      layout,
    );

    if (skills.length === 0) {
      return this.drawMutedText(
        document,
        '등록된 핵심 역량 정보가 없습니다.',
        cursorY,
        layout,
      );
    }

    let tagX = layout.left;
    let tagY = cursorY;
    const horizontalGap = 7;
    const verticalGap = 8;
    const tagHeight = 22;

    for (const skill of skills) {
      const text = skill.trim();
      if (!text) {
        continue;
      }

      this.applyRegularFont(document);
      document.fontSize(9.3);
      const tagWidth = Math.min(
        document.widthOfString(text) + 16,
        layout.width * 0.85,
      );

      if (tagX + tagWidth > layout.right) {
        tagX = layout.left;
        tagY += tagHeight + verticalGap;
      }

      tagY = context.ensureSpace(tagY, tagHeight + 4);
      layout = context.getLayout();

      if (tagX + tagWidth > layout.right) {
        tagX = layout.left;
        tagY += tagHeight + verticalGap;
        tagY = context.ensureSpace(tagY, tagHeight + 4);
        layout = context.getLayout();
      }

      document
        .save()
        .roundedRect(tagX, tagY, tagWidth, tagHeight, 11)
        .fillAndStroke('#edf4ff', '#c9daf8')
        .restore();

      this.applyRegularFont(document);
      document
        .fontSize(9.3)
        .fillColor(this.colors.brand)
        .text(text, tagX + 8, tagY + 6, {
          width: tagWidth - 16,
          align: 'center',
        });

      tagX += tagWidth + horizontalGap;
    }

    return tagY + tagHeight + 14;
  }

  private drawWorkExperienceSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    const workExperience = member.workExperience ?? [];
    let cursorY = context.ensureSpace(context.cursorY, 80);
    let layout = context.getLayout();

    cursorY = this.drawSectionHeader(
      document,
      'Work Experience',
      cursorY,
      layout,
    );

    if (workExperience.length === 0) {
      return this.drawMutedText(
        document,
        '등록된 경력 정보가 없습니다.',
        cursorY,
        layout,
      );
    }

    for (const item of workExperience) {
      layout = context.getLayout();
      const cardHeight = this.estimateWorkExperienceCardHeight(
        document,
        item,
        layout,
      );
      cursorY = context.ensureSpace(cursorY, cardHeight + 10);
      layout = context.getLayout();
      cursorY = this.drawWorkExperienceCard(document, item, cursorY, layout);
    }

    return cursorY + 4;
  }

  private drawProjectsSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    const projects = member.projects ?? [];
    let cursorY = context.ensureSpace(context.cursorY, 80);
    let layout = context.getLayout();

    cursorY = this.drawSectionHeader(
      document,
      'Selected Projects',
      cursorY,
      layout,
    );

    if (projects.length === 0) {
      return this.drawMutedText(
        document,
        '등록된 프로젝트 정보가 없습니다.',
        cursorY,
        layout,
      );
    }

    projects.slice(0, 6).forEach((project, index) => {
      layout = context.getLayout();
      const cardHeight = this.estimateProjectCardHeight(
        document,
        project,
        layout,
      );
      cursorY = context.ensureSpace(cursorY, cardHeight + 10);
      layout = context.getLayout();
      cursorY = this.drawProjectCard(
        document,
        project,
        index + 1,
        cursorY,
        layout,
      );
    });

    return cursorY + 4;
  }

  private drawCertificationSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    const certifications = member.certifications ?? [];
    let cursorY = context.ensureSpace(context.cursorY, 64);
    let layout = context.getLayout();

    cursorY = this.drawSectionHeader(
      document,
      'Certifications',
      cursorY,
      layout,
    );

    if (certifications.length === 0) {
      return this.drawMutedText(
        document,
        '등록된 자격증 정보가 없습니다.',
        cursorY,
        layout,
      );
    }

    const contentWidth = layout.width - 20;
    const bulletWidth = Math.floor((contentWidth - 12) / 2);
    const maxItems = Math.min(16, certifications.length);
    let y = cursorY;
    let index = 0;

    while (index < maxItems) {
      y = context.ensureSpace(y, 30);
      layout = context.getLayout();

      for (let column = 0; column < 2 && index < maxItems; column += 1) {
        const certification = certifications[index];
        const x = layout.left + 10 + column * (bulletWidth + 12);
        const text = this.formatCertification(certification);

        this.applyRegularFont(document);
        document
          .fontSize(9.5)
          .fillColor(this.colors.textBody)
          .text(`• ${text}`, x, y, {
            width: bulletWidth,
            lineGap: 3,
          });

        index += 1;
      }

      y = document.y + 4;
    }

    return y + 6;
  }

  private drawEducationSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    const education = member.education ?? [];
    let cursorY = context.ensureSpace(context.cursorY, 64);
    let layout = context.getLayout();

    cursorY = this.drawSectionHeader(document, 'Education', cursorY, layout);

    if (education.length === 0) {
      return this.drawMutedText(
        document,
        '등록된 학력 정보가 없습니다.',
        cursorY,
        layout,
      );
    }

    for (const item of education) {
      layout = context.getLayout();
      const itemHeight = this.estimateEducationHeight(document, item, layout);
      cursorY = context.ensureSpace(cursorY, itemHeight + 8);
      layout = context.getLayout();
      cursorY = this.drawEducationItem(document, item, cursorY, layout);
    }

    return cursorY + 6;
  }

  private drawLinksSection(
    document: PDFKit.PDFDocument,
    member: MemberProfile,
    context: SectionContext,
  ): number {
    const links = [
      member.links?.homepage ? ['Homepage', member.links.homepage] : null,
      member.links?.blog ? ['Blog', member.links.blog] : null,
      member.links?.resume && this.isExternalUrl(member.links.resume)
        ? ['Resume', member.links.resume]
        : null,
    ].filter((item): item is [string, string] => Boolean(item));

    if (links.length === 0) {
      return context.cursorY;
    }

    let cursorY = context.ensureSpace(context.cursorY, 64);
    const layout = context.getLayout();

    cursorY = this.drawSectionHeader(
      document,
      'Profile Links',
      cursorY,
      layout,
    );
    cursorY = context.ensureSpace(cursorY, links.length * 24 + 16);

    document
      .save()
      .roundedRect(
        layout.left,
        cursorY,
        layout.width,
        links.length * 22 + 12,
        8,
      )
      .fillAndStroke(this.colors.surface, this.colors.border)
      .restore();

    let rowY = cursorY + 8;

    links.forEach(([label, value], index) => {
      this.applyBoldFont(document);
      document
        .fontSize(9.3)
        .fillColor(this.colors.textMuted)
        .text(label.toUpperCase(), layout.left + 12, rowY, {
          width: 76,
        });

      this.applyRegularFont(document);
      document
        .fontSize(9.8)
        .fillColor(this.colors.brand)
        .text(value, layout.left + 92, rowY, {
          width: layout.width - 104,
          underline: true,
        });

      rowY = document.y + 4;

      if (index < links.length - 1) {
        document
          .save()
          .moveTo(layout.left + 12, rowY)
          .lineTo(layout.right - 12, rowY)
          .lineWidth(0.7)
          .strokeColor(this.colors.border)
          .stroke()
          .restore();

        rowY += 4;
      }
    });

    return rowY + 4;
  }

  private drawSectionHeader(
    document: PDFKit.PDFDocument,
    title: string,
    y: number,
    layout: PageLayout,
  ): number {
    this.applyBoldFont(document);
    document
      .fontSize(12.6)
      .fillColor(this.colors.brand)
      .text(title, layout.left, y, {
        width: layout.width,
      });

    const lineY = document.y + 4;
    document
      .save()
      .moveTo(layout.left, lineY)
      .lineTo(layout.right, lineY)
      .lineWidth(1)
      .strokeColor(this.colors.border)
      .stroke()
      .restore();

    return lineY + 8;
  }

  private drawMutedText(
    document: PDFKit.PDFDocument,
    text: string,
    y: number,
    layout: PageLayout,
  ): number {
    this.applyRegularFont(document);
    document
      .fontSize(9.8)
      .fillColor(this.colors.textSubtle)
      .text(text, layout.left, y, {
        width: layout.width,
      });

    return document.y + 8;
  }

  private estimateWorkExperienceCardHeight(
    document: PDFKit.PDFDocument,
    item: MemberWorkExperience,
    layout: PageLayout,
  ): number {
    const contentWidth = layout.width - 26;
    const title = `${item.company} | ${item.position}`;
    const bulletText = item.description.map((entry) => `• ${entry}`).join('\n');

    this.applyBoldFont(document);
    document.fontSize(10.8);
    const titleHeight = document.heightOfString(title, { width: contentWidth });

    this.applyRegularFont(document);
    document.fontSize(9.5);
    const periodHeight = document.heightOfString(item.period, {
      width: contentWidth,
    });

    document.fontSize(9.8);
    const descriptionHeight = document.heightOfString(bulletText, {
      width: contentWidth,
      lineGap: 3,
    });

    return titleHeight + periodHeight + descriptionHeight + 32;
  }

  private drawWorkExperienceCard(
    document: PDFKit.PDFDocument,
    item: MemberWorkExperience,
    y: number,
    layout: PageLayout,
  ): number {
    const cardHeight = this.estimateWorkExperienceCardHeight(
      document,
      item,
      layout,
    );
    const cardX = layout.left;
    const cardY = y;
    const contentX = cardX + 12;
    const contentWidth = layout.width - 26;

    document
      .save()
      .roundedRect(cardX, cardY, layout.width, cardHeight, 8)
      .fillAndStroke(this.colors.white, this.colors.border)
      .restore();

    document
      .save()
      .rect(cardX, cardY, 4, cardHeight)
      .fill(this.colors.accent)
      .restore();

    this.applyBoldFont(document);
    document
      .fontSize(10.8)
      .fillColor(this.colors.textStrong)
      .text(`${item.company} | ${item.position}`, contentX, cardY + 10, {
        width: contentWidth,
      });

    this.applyRegularFont(document);
    document
      .fontSize(9.4)
      .fillColor(this.colors.textSubtle)
      .text(item.period, contentX, document.y + 2, {
        width: contentWidth,
      });

    const bulletText = item.description.map((entry) => `• ${entry}`).join('\n');
    document
      .fontSize(9.8)
      .fillColor(this.colors.textBody)
      .text(bulletText, contentX, document.y + 5, {
        width: contentWidth,
        lineGap: 3,
      });

    return cardY + cardHeight + 10;
  }

  private estimateProjectCardHeight(
    document: PDFKit.PDFDocument,
    project: MemberProject,
    layout: PageLayout,
  ): number {
    const contentWidth = layout.width - 26;
    const stackLine = project.technologies.join(' · ');

    this.applyBoldFont(document);
    document.fontSize(10.6);
    const titleHeight = document.heightOfString(project.title, {
      width: contentWidth,
    });

    this.applyRegularFont(document);
    document.fontSize(9.8);
    const descriptionHeight = document.heightOfString(project.description, {
      width: contentWidth,
      lineGap: 3,
    });

    document.fontSize(9.2);
    const stackHeight = stackLine
      ? document.heightOfString(stackLine, {
          width: contentWidth,
        })
      : 0;

    const industryHeight = project.industry
      ? document.heightOfString(project.industry, {
          width: contentWidth,
        })
      : 0;

    return titleHeight + descriptionHeight + stackHeight + industryHeight + 40;
  }

  private drawProjectCard(
    document: PDFKit.PDFDocument,
    project: MemberProject,
    index: number,
    y: number,
    layout: PageLayout,
  ): number {
    const cardHeight = this.estimateProjectCardHeight(
      document,
      project,
      layout,
    );
    const cardX = layout.left;
    const contentX = cardX + 12;
    const contentWidth = layout.width - 26;

    document
      .save()
      .roundedRect(cardX, y, layout.width, cardHeight, 8)
      .fillAndStroke(this.colors.white, this.colors.border)
      .restore();

    this.applyBoldFont(document);
    document
      .fontSize(8.6)
      .fillColor(this.colors.textSubtle)
      .text(`PROJECT ${index}`, contentX, y + 9, {
        width: contentWidth,
      });

    this.applyBoldFont(document);
    document
      .fontSize(10.6)
      .fillColor(this.colors.textStrong)
      .text(project.title, contentX, document.y + 2, {
        width: contentWidth,
      });

    if (project.industry) {
      this.applyRegularFont(document);
      document
        .fontSize(9.2)
        .fillColor(this.colors.textSubtle)
        .text(project.industry, contentX, document.y + 1, {
          width: contentWidth,
        });
    }

    this.applyRegularFont(document);
    document
      .fontSize(9.8)
      .fillColor(this.colors.textBody)
      .text(project.description, contentX, document.y + 4, {
        width: contentWidth,
        lineGap: 3,
      });

    const technologies = project.technologies.join(' · ');
    if (technologies) {
      this.applyRegularFont(document);
      document
        .fontSize(9.2)
        .fillColor(this.colors.brand)
        .text(technologies, contentX, document.y + 6, {
          width: contentWidth,
          lineGap: 2,
        });
    }

    return y + cardHeight + 12;
  }

  private estimateEducationHeight(
    document: PDFKit.PDFDocument,
    education: MemberEducation,
    layout: PageLayout,
  ): number {
    const width = layout.width;
    this.applyBoldFont(document);
    document.fontSize(10.2);
    const titleHeight = document.heightOfString(
      `${education.degree} | ${education.major}`,
      { width },
    );

    this.applyRegularFont(document);
    document.fontSize(9.3);
    const meta = [education.university, education.period]
      .filter((value): value is string => Boolean(value))
      .join(' · ');
    const metaHeight = meta
      ? document.heightOfString(meta, { width, lineGap: 2 })
      : 0;

    return titleHeight + metaHeight + 12;
  }

  private drawEducationItem(
    document: PDFKit.PDFDocument,
    education: MemberEducation,
    y: number,
    layout: PageLayout,
  ): number {
    this.applyBoldFont(document);
    document
      .fontSize(10.2)
      .fillColor(this.colors.textStrong)
      .text(`${education.degree} | ${education.major}`, layout.left, y, {
        width: layout.width,
      });

    const meta = [education.university, education.period]
      .filter((value): value is string => Boolean(value))
      .join(' · ');

    if (meta) {
      this.applyRegularFont(document);
      document
        .fontSize(9.3)
        .fillColor(this.colors.textSubtle)
        .text(meta, layout.left, document.y + 1, {
          width: layout.width,
          lineGap: 2,
        });
    }

    return document.y + 7;
  }

  private formatCertification(certification: MemberCertification): string {
    const suffix = certification.date ? ` (${certification.date})` : '';
    return `${certification.name} - ${certification.issuer}${suffix}`;
  }

  private collectSkills(member: MemberProfile): string[] {
    const fromTechnicalSkills = (member.technicalSkills ?? []).flatMap(
      (group) => group.skills,
    );
    const candidates =
      fromTechnicalSkills.length > 0
        ? fromTechnicalSkills
        : (member.specialties ?? []);

    const uniqueSkills = Array.from(
      new Set(
        candidates
          .map((skill) => skill.trim())
          .filter((skill): skill is string => skill.length > 0),
      ),
    );

    return uniqueSkills.slice(0, 28);
  }

  private shortenUrl(value: string): string {
    try {
      const parsed = new URL(value);
      return `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
    } catch {
      return value;
    }
  }

  private isExternalUrl(value: string): boolean {
    return /^https?:\/\//i.test(value.trim());
  }

  private applyRegularFont(document: PDFKit.PDFDocument): void {
    if (this.useCustomFont) {
      document.font(this.regularFontPath);
      return;
    }

    document.font('Helvetica');
  }

  private applyBoldFont(document: PDFKit.PDFDocument): void {
    if (this.useCustomFont) {
      document.font(this.boldFontPath);
      return;
    }

    document.font('Helvetica-Bold');
  }
}
