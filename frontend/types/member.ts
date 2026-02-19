export interface Member {
  slug?: string;
  name: string;
  role: string;
  affiliation?: string;
  category: "senior" | "mentee";
  achievements?: string[];
  experience?: string;
  bio?: string;
  specialties?: string[];
  profileImage?: string;
  // 포트폴리오 상세 정보
  education?: {
    degree: string;
    major: string;
    university: string;
    period?: string;
    thesis?: string;
    lab?: string;
    description?: string;
    papers?: {
      title: string;
      type: string;
      date: string;
      authors?: string;
    }[];
  }[];
  workExperience?: {
    company: string;
    position: string;
    period: string;
    description: string[];
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date?: string;
  }[];
  projects?: {
    title: string;
    description: string;
    technologies: string[];
    industry?: string;
  }[];
  technicalSkills?: {
    category: string;
    skills: string[];
  }[];
  mentoring?: {
    count: number;
    description: string;
  };
  links?: {
    blog?: string;
    homepage?: string;
    resume?: string;
  };
}
