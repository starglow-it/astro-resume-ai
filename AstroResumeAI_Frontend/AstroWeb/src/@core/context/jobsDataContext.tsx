// src/@core/context/profileDataContext.tsx
import React, { createContext, useState, useContext } from 'react'
import { JobData } from 'src/types/JobData'

interface JobsContexttProps {
  jobsData: JobData[]
  pageNumber: number
  count: number
  setJobsData: React.Dispatch<React.SetStateAction<JobData[]>>
  setPageNumber: React.Dispatch<React.SetStateAction<number>>
  setCount: React.Dispatch<React.SetStateAction<number>>
}

export const JobsDataContext = createContext<JobsContexttProps | null>(null)

export const useJobsData = () => {
  const context = useContext(JobsDataContext)
  if (!context) {
    throw new Error('useJobsData must be used within a JobsDataProvider')
  }
  return context
}

export const JobsDataProvider: React.FC = ({ children }) => {
  const [jobsData, setJobsData] = useState<JobData[]>([])
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [count, setCount] = useState<number>(1)

  return (
    <JobsDataContext.Provider value={{ jobsData, pageNumber, count, setJobsData, setPageNumber, setCount }}>
      {children}
    </JobsDataContext.Provider>
  )
}
