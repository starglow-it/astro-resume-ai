// src/@core/context/profileDataContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { FetchedProfileData, ProfileData } from 'src/types/ProfileData';

interface ProfileContextProps {
  profileData: ProfileData;
  profileList: FetchedProfileData[];
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  setProfileList: React.Dispatch<React.SetStateAction<FetchedProfileData[]>>;
}

export const ProfileDataContext = createContext<ProfileContextProps | null>(null);

export const useProfileData = () => {
  const context = useContext(ProfileDataContext);
  if (!context) {
    throw new Error('useProfileData must be used within a ProfileDataProvider');
  }
  return context;
};

export const ProfileDataProvider: React.FC = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    recent_role: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    WorkAuthorization: '',
    linkedin: '',
    github: '',
    website: '',
  });

  const [profileList, setProfileList] = useState<FetchedProfileData[]>([])

  return (
    <ProfileDataContext.Provider value={{ profileData, profileList, setProfileData, setProfileList }}>
      {children}
    </ProfileDataContext.Provider>
  );
};
