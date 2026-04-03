import { MemberProfile } from '../../domain/member-profile';

interface BuildMemberPortfolioHtmlInput {
  member: MemberProfile;
  profileImageDataUrl?: string;
  regularFontDataUrl?: string;
  boldFontDataUrl?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase();
}

function renderSectionHeading(eyebrow: string, title: string): string {
  return `
    <div class="section-heading">
      <p class="section-eyebrow">${escapeHtml(eyebrow)}</p>
      <h2 class="section-title">${escapeHtml(title)}</h2>
    </div>
  `;
}

function renderFooter(member: MemberProfile): string {
  return `
    <footer class="page-footer">
      <span>Nangman Infra Portfolio</span>
      <span>${escapeHtml(member.name)}</span>
    </footer>
  `;
}

function renderProfileImage(
  member: MemberProfile,
  profileImageDataUrl?: string,
): string {
  if (profileImageDataUrl) {
    return `
      <img
        class="profile-image"
        src="${profileImageDataUrl}"
        alt="${escapeHtml(member.name)}"
      />
    `;
  }

  return `
    <div class="profile-image profile-image-fallback">
      ${escapeHtml(initials(member.name))}
    </div>
  `;
}

function renderLinks(member: MemberProfile): string {
  const links = [
    member.links?.homepage
      ? { label: 'Homepage', url: member.links.homepage }
      : null,
    member.links?.blog ? { label: 'Blog', url: member.links.blog } : null,
    member.links?.resume ? { label: 'Resume', url: member.links.resume } : null,
  ].filter((value): value is { label: string; url: string } => value !== null);

  if (links.length === 0) {
    return '';
  }

  return `
    <div class="link-list">
      ${links
        .map(
          (link) => `
            <div class="link-row">
              <span class="link-label">${escapeHtml(link.label)}</span>
              <span class="link-value">${escapeHtml(link.url)}</span>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderFocusAreas(member: MemberProfile): string {
  const specialties = member.specialties ?? [];
  if (specialties.length === 0) {
    return '';
  }

  return `
    <section>
      ${renderSectionHeading('Focus', 'Core Areas')}
      <div class="badge-list">
        ${specialties
          .map((specialty) => `<span class="badge">${escapeHtml(specialty)}</span>`)
          .join('')}
      </div>
    </section>
  `;
}

function renderHighlights(member: MemberProfile): string {
  const highlights = [
    ...(member.achievements ?? []),
    ...(member.mentoring ? [member.mentoring.description] : []),
  ];

  if (highlights.length === 0) {
    return '';
  }

  return `
    <section>
      ${renderSectionHeading('Highlights', 'Notes')}
      <div class="highlight-list">
        ${highlights
          .map(
            (highlight) => `
              <div class="highlight-item">${escapeHtml(highlight)}</div>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderSummary(member: MemberProfile): string {
  const summary = member.bio?.trim() || member.experience?.trim() || '';
  if (!summary) {
    return '';
  }

  return `
    <section>
      ${renderSectionHeading('Profile', 'Summary')}
      <div class="summary-copy">
        <p>${escapeHtml(summary)}</p>
      </div>
    </section>
  `;
}

function renderWorkExperience(member: MemberProfile): string {
  const experiences = member.workExperience ?? [];
  if (experiences.length === 0) {
    return '';
  }

  return `
    <section>
      ${renderSectionHeading('Career', 'Work Experience')}
      <div class="stack gap-lg section-content">
        ${experiences
          .map(
            (experience, index) => `
              <article class="timeline-item${index === 0 ? ' timeline-item-first' : ''}">
                <div class="timeline-header">
                  <div>
                    <h3 class="item-title">${escapeHtml(experience.company)}</h3>
                    <p class="item-subtitle">${escapeHtml(experience.position)}</p>
                  </div>
                  <p class="item-period">${escapeHtml(experience.period)}</p>
                </div>
                <ul class="bullet-list">
                  ${experience.description
                    .map(
                      (line) => `
                        <li class="bullet-list-item">
                          <span class="bullet-dot"></span>
                          <span>${escapeHtml(line)}</span>
                        </li>
                      `,
                    )
                    .join('')}
                </ul>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderProjects(member: MemberProfile): string {
  const projects = member.projects ?? [];
  if (projects.length === 0) {
    return '';
  }

  return `
    <section>
      ${renderSectionHeading('Projects', 'Selected Projects')}
      <div class="stack gap-lg section-content">
        ${projects
          .map(
            (project, index) => `
              <article class="list-entry${index === 0 ? ' list-entry-first' : ''}">
                <div class="list-entry-header">
                  <h3 class="item-title">${escapeHtml(project.title)}</h3>
                  ${
                    project.industry
                      ? `<p class="item-period">${escapeHtml(project.industry)}</p>`
                      : ''
                  }
                </div>
                <p class="body-copy">${escapeHtml(project.description)}</p>
                <p class="meta-line">${escapeHtml(project.technologies.join(' · '))}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderTechnicalSkills(member: MemberProfile): string {
  const skillGroups = member.technicalSkills ?? [];
  if (skillGroups.length === 0) {
    return '';
  }

  return `
    <section>
      <p class="section-label">Technical Skills</p>
      <div class="skill-grid">
        ${skillGroups
          .map(
            (group) => `
              <article class="skill-card">
                <h3 class="skill-title">${escapeHtml(group.category)}</h3>
                <p class="body-copy">${escapeHtml(group.skills.join(' · '))}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderCertifications(member: MemberProfile): string {
  const certifications = member.certifications ?? [];
  if (certifications.length === 0) {
    return '';
  }

  return `
    <section>
      <p class="section-label">Certifications</p>
      <div class="stack gap-md compact-section">
        ${certifications
          .map(
            (certification, index) => `
              <article class="list-entry${index === 0 ? ' list-entry-first' : ''}">
                <h3 class="item-title">${escapeHtml(certification.name)}</h3>
                <p class="item-subtitle">${escapeHtml(certification.issuer)}</p>
                ${
                  certification.date
                    ? `<p class="meta-line">${escapeHtml(certification.date)}</p>`
                    : ''
                }
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderEducation(member: MemberProfile): string {
  const educationEntries = member.education ?? [];
  if (educationEntries.length === 0) {
    return '';
  }

  return `
    <section>
      <p class="section-label">Education</p>
      <div class="stack gap-md compact-section">
        ${educationEntries
          .map(
            (education, index) => `
              <article class="list-entry${index === 0 ? ' list-entry-first' : ''}">
                <div class="list-entry-header">
                  <div>
                    <h3 class="item-title">
                      ${escapeHtml(`${education.degree} · ${education.major}`)}
                    </h3>
                    <p class="item-subtitle">${escapeHtml(education.university)}</p>
                  </div>
                  ${
                    education.period
                      ? `<p class="item-period">${escapeHtml(education.period)}</p>`
                      : ''
                  }
                </div>
                ${
                  education.description
                    ? `<p class="body-copy">${escapeHtml(education.description)}</p>`
                    : ''
                }
                ${
                  education.papers?.length
                    ? `
                      <div class="paper-list">
                        ${education.papers
                          .map(
                            (paper) => `
                              <p class="paper-line">
                                ${escapeHtml(
                                  `${paper.title} · ${paper.type} · ${paper.date}`,
                                )}
                              </p>
                            `,
                          )
                          .join('')}
                      </div>
                    `
                    : ''
                }
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderCoverSheet(
  member: MemberProfile,
  profileImageDataUrl?: string,
): string {
  const summaryHtml = renderSummary(member);
  const focusHtml = renderFocusAreas(member);
  const highlightsHtml = renderHighlights(member);
  const sidebarHtml = [focusHtml, highlightsHtml].filter(Boolean).join('');
  const hasSidebar = Boolean(sidebarHtml);
  const coverBodyHtml = [summaryHtml, sidebarHtml].filter(Boolean).join('');
  const pageGridClass = hasSidebar ? 'page-grid-summary' : 'page-grid-single';
  const sidebarBlockHtml = hasSidebar
    ? `<aside class="stack gap-lg">${sidebarHtml}</aside>`
    : '';
  const pageGridHtml = coverBodyHtml
    ? `
      <div class="page-grid ${pageGridClass}">
        ${summaryHtml}
        ${sidebarBlockHtml}
      </div>
    `
    : '';

  return `
    <section class="sheet">
      <div class="page-content">
        <header class="hero">
          <div class="hero-copy">
            <p class="hero-eyebrow">
              ${escapeHtml(
                member.category === 'senior' ? 'Mentor Portfolio' : 'Mentee Portfolio',
              )}
            </p>
            <h1 class="hero-name">${escapeHtml(member.name)}</h1>
            <p class="hero-role">${escapeHtml(member.role)}</p>
            ${
              member.affiliation
                ? `<p class="hero-affiliation">${escapeHtml(member.affiliation)}</p>`
                : ''
            }
            ${
              member.experience
                ? `<p class="hero-experience">${escapeHtml(member.experience)}</p>`
                : ''
            }
            ${renderLinks(member)}
          </div>

          ${renderProfileImage(member, profileImageDataUrl)}
        </header>

        ${pageGridHtml}
      </div>

      ${renderFooter(member)}
    </section>
  `;
}

function renderGenericSheet(member: MemberProfile, content: string): string {
  return `
    <section class="sheet">
      <div class="page-content">
        ${content}
      </div>

      ${renderFooter(member)}
    </section>
  `;
}

function buildCapabilitiesSheet(member: MemberProfile): string {
  const technicalSkillsHtml = renderTechnicalSkills(member);
  const certificationsHtml = renderCertifications(member);
  const educationHtml = renderEducation(member);

  const lowerSections = [certificationsHtml, educationHtml].filter(Boolean);
  const lowerSectionsClass =
    lowerSections.length <= 1 ? 'page-grid-single' : 'page-grid-columns';
  const technicalSkillsSectionHtml = technicalSkillsHtml
    ? `<section class="section-block section-block-first">${technicalSkillsHtml}</section>`
    : '';
  const lowerSectionsBlockClass = technicalSkillsHtml
    ? 'section-block'
    : 'section-block section-block-first';
  const lowerSectionsHtml =
    lowerSections.length > 0
      ? `
        <div class="${lowerSectionsClass} ${lowerSectionsBlockClass}">
          ${lowerSections.join('')}
        </div>
      `
      : '';
  const bodyParts = [
    renderSectionHeading('Capabilities', 'Skills, Certifications & Education'),
    technicalSkillsSectionHtml,
    lowerSectionsHtml,
  ].filter(Boolean);

  if (bodyParts.length === 1) {
    return '';
  }

  return renderGenericSheet(member, bodyParts.join(''));
}

function buildFontFaceCss(
  regularFontDataUrl?: string,
  boldFontDataUrl?: string,
): string {
  const rules: string[] = [];

  if (regularFontDataUrl) {
    rules.push(`
      @font-face {
        font-family: "Portfolio Sans";
        font-style: normal;
        font-weight: 400;
        src: url("${regularFontDataUrl}") format("woff");
      }
    `);
  }

  if (boldFontDataUrl) {
    rules.push(`
      @font-face {
        font-family: "Portfolio Sans";
        font-style: normal;
        font-weight: 700;
        src: url("${boldFontDataUrl}") format("woff");
      }
    `);
  }

  return rules.join('\n');
}

export function buildMemberPortfolioHtml({
  member,
  profileImageDataUrl,
  regularFontDataUrl,
  boldFontDataUrl,
}: BuildMemberPortfolioHtmlInput): string {
  const fontFaceCss = buildFontFaceCss(regularFontDataUrl, boldFontDataUrl);
  const workExperienceSheet = renderWorkExperience(member);
  const projectsSheet = renderProjects(member);
  const capabilitiesSheet = buildCapabilitiesSheet(member);
  const sheets = [
    renderCoverSheet(member, profileImageDataUrl),
    workExperienceSheet ? renderGenericSheet(member, workExperienceSheet) : '',
    projectsSheet ? renderGenericSheet(member, projectsSheet) : '',
    capabilitiesSheet,
  ].filter(Boolean);

  return `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <title>${escapeHtml(member.name)} Portfolio</title>
        <style>
          ${fontFaceCss}

          :root {
            color-scheme: light only;
            --paper: #ffffff;
            --ink: #0f172a;
            --muted: #475569;
            --subtle: #64748b;
            --border: #dbe3ee;
            --line: #e2e8f0;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: var(--paper);
            color: var(--ink);
            font-family: "Portfolio Sans", "Noto Sans KR", sans-serif;
            line-break: strict;
          }

          @page {
            size: A4;
            margin: 12mm;
          }

          .document {
            width: 100%;
          }

          .sheet {
            min-height: 273mm;
            display: flex;
            flex-direction: column;
            background: var(--paper);
            page-break-after: always;
          }

          .sheet:last-child {
            page-break-after: auto;
          }

          .page-content {
            flex: 1;
          }

          .hero {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 32px;
            border-bottom: 1px solid var(--line);
            padding-bottom: 32px;
          }

          .hero-copy {
            min-width: 0;
            flex: 1;
          }

          .hero-eyebrow,
          .section-eyebrow,
          .section-label {
            margin: 0;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.34em;
            text-transform: uppercase;
            color: var(--subtle);
          }

          .hero-name {
            margin: 16px 0 0;
            font-size: 42px;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 1.06;
          }

          .hero-role {
            margin: 16px 0 0;
            font-size: 24px;
            font-weight: 700;
            line-height: 1.35;
            color: #1e293b;
            word-break: keep-all;
            overflow-wrap: break-word;
          }

          .hero-affiliation,
          .hero-experience,
          .body-copy,
          .item-subtitle,
          .highlight-item,
          .paper-line {
            margin: 0;
            font-size: 14px;
            line-height: 1.8;
            color: var(--muted);
            word-break: keep-all;
            overflow-wrap: break-word;
          }

          .hero-affiliation {
            margin-top: 14px;
          }

          .hero-experience {
            margin-top: 4px;
            color: var(--subtle);
          }

          .link-list {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px 24px;
          }

          .link-row {
            display: flex;
            gap: 8px;
            min-width: 220px;
            max-width: 100%;
          }

          .link-label {
            font-weight: 700;
            color: var(--ink);
            white-space: nowrap;
          }

          .link-value {
            color: var(--subtle);
            word-break: break-all;
            overflow-wrap: anywhere;
          }

          .profile-image {
            width: 112px;
            height: 112px;
            border: 1px solid var(--border);
            border-radius: 18px;
            object-fit: cover;
            flex-shrink: 0;
          }

          .profile-image-fallback {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-size: 32px;
            font-weight: 700;
            color: var(--subtle);
          }

          .page-grid {
            display: grid;
            gap: 40px;
            margin-top: 40px;
          }

          .page-grid-summary {
            grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.75fr);
          }

          .page-grid-single {
            grid-template-columns: 1fr;
          }

          .stack {
            display: flex;
            flex-direction: column;
          }

          .gap-md {
            gap: 24px;
          }

          .gap-lg {
            gap: 32px;
          }

          .section-title {
            margin: 8px 0 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.03em;
            line-height: 1.18;
            word-break: keep-all;
            overflow-wrap: break-word;
          }

          .summary-copy {
            margin-top: 20px;
          }

          .summary-copy p {
            margin: 0;
            font-size: 14px;
            line-height: 1.85;
            color: var(--muted);
            word-break: keep-all;
            overflow-wrap: break-word;
          }

          .badge-list {
            margin-top: 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 7px 12px;
            font-size: 12px;
            color: #334155;
          }

          .highlight-list {
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .highlight-item {
            border-left: 2px solid var(--ink);
            padding-left: 16px;
          }

          .section-content {
            margin-top: 24px;
          }

          .timeline-item,
          .list-entry,
          .skill-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .timeline-item,
          .list-entry {
            border-top: 1px solid var(--line);
            padding-top: 24px;
          }

          .timeline-item-first,
          .list-entry-first {
            border-top: 0;
            padding-top: 0;
          }

          .timeline-header,
          .list-entry-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
          }

          .item-title {
            margin: 0;
            font-size: 19px;
            font-weight: 700;
            line-height: 1.4;
            color: var(--ink);
            word-break: keep-all;
            overflow-wrap: break-word;
          }

          .item-subtitle {
            margin-top: 4px;
            font-weight: 700;
          }

          .item-period,
          .meta-line {
            margin: 0;
            font-size: 12px;
            line-height: 1.8;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--subtle);
          }

          .body-copy {
            margin-top: 12px;
          }

          .bullet-list {
            margin: 16px 0 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .bullet-list-item {
            display: flex;
            gap: 12px;
            font-size: 14px;
            line-height: 1.8;
            color: var(--muted);
            word-break: keep-all;
            overflow-wrap: break-word;
          }

          .bullet-dot {
            width: 6px;
            height: 6px;
            margin-top: 10px;
            border-radius: 999px;
            background: #94a3b8;
            flex-shrink: 0;
          }

          .section-block {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid var(--line);
          }

          .section-block-first {
            margin-top: 24px;
            padding-top: 0;
            border-top: 0;
          }

          .skill-grid {
            margin-top: 16px;
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .skill-card {
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 16px;
          }

          .skill-title {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            color: var(--ink);
          }

          .page-grid-columns {
            margin-top: 32px;
            display: grid;
            gap: 24px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .compact-section {
            margin-top: 16px;
          }

          .paper-list {
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .page-footer {
            margin-top: 28px;
            padding-top: 16px;
            border-top: 1px solid var(--line);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            font-size: 11px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <main class="document">
          ${sheets.join('')}
        </main>
      </body>
    </html>
  `;
}
