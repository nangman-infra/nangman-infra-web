export type MemberCategory = 'senior' | 'mentee';

export interface MemberEducationPaper {
  title: string;
  type: string;
  date: string;
  authors?: string;
}

export interface MemberEducation {
  degree: string;
  major: string;
  university: string;
  period?: string;
  thesis?: string;
  lab?: string;
  description?: string;
  papers?: MemberEducationPaper[];
}

export interface MemberWorkExperience {
  company: string;
  position: string;
  period: string;
  description: string[];
}

export interface MemberCertification {
  name: string;
  issuer: string;
  date?: string;
}

export interface MemberProject {
  title: string;
  description: string;
  technologies: string[];
  industry?: string;
}

export interface MemberTechnicalSkillGroup {
  category: string;
  skills: string[];
}

export interface MemberMentoring {
  count: number;
  description: string;
}

export interface MemberLinks {
  blog?: string;
  homepage?: string;
  resume?: string;
}

export interface MemberProfile {
  slug: string;
  name: string;
  role: string;
  affiliation?: string;
  category: MemberCategory;
  achievements?: string[];
  experience?: string;
  bio?: string;
  specialties?: string[];
  profileImage?: string;
  education?: MemberEducation[];
  workExperience?: MemberWorkExperience[];
  certifications?: MemberCertification[];
  projects?: MemberProject[];
  technicalSkills?: MemberTechnicalSkillGroup[];
  mentoring?: MemberMentoring;
  links?: MemberLinks;
}
