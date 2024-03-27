// ProfileData.ts
export type ProfileData = {
    name: string;
    email: string;
    recent_role: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    education: {
      university: string;
      education_level: string;
      graduation_year: string;
      major: string
    }[];
    experience: {
      job_title: string;
      company: string;
      location: string;
      duration: string;
      description: string;
    }[];
    WorkAuthorization: string;
    website: string,
    linkedin: string;
    github: string;
  };
  

export type FetchedProfileData = {
    id: string;
    user: string;
    name: string;
    email: string;
    recent_role: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    education: {
      id: string;
      university: string;
      education_level: string;
      graduation_year: string;
      major: string
    }[];
    experience: {
      id: string;
      job_title: string;
      company: string;
      location: string;
      duration: string;
      description: string;
    }[];
    WorkAuthorization: string;
    website: string,
    linkedin: string;
    github: string;
  };
  