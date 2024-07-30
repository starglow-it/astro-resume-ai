export interface DeleteJobPostsResponse {
  message: string;
}

export type JobData = {
  id: number
  site: string
  title: string
  company: string
  is_easy_apply: boolean
  job_url: string | null
  job_url_direct: string | null
  location: string | null
  description: string | null
  company_url: string | null
  company_url_direct: string | null
  job_type: string | null
  interval: string | null
  min_amount: number | null
  max_amount: number | null
  currency: string | null
  date_posted: string | null
  emails: string | null
  is_remote: boolean | null
  company_addresses: string | null
  company_industry: string | null
  company_num_employees: string | null
  company_revenue: string | null
  company_description: string | null
  ceo_name: string | null
  ceo_photo_url: string | null
  logo_photo_url: string | null
  banner_photo_url: string | null
}
