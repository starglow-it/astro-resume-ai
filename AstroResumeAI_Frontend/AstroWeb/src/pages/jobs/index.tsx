// ** React Imports
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Axios, { AxiosResponse } from 'axios'

//Interface
import { DeleteJobPostsResponse, JobData } from 'src/types/JobData';

// ** MUI Imports
import Grid from '@mui/material/Grid'

import {
  DataGrid,
  GridSortModel,
  GridPaginationModel,
  GridPagination,
  useGridApiContext,
  gridPageCountSelector,
  useGridSelector,
  GridColDef,
  GridRowSelectionModel
} from '@mui/x-data-grid'
import { Magnify } from 'mdi-material-ui'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'

import { useJobsData } from 'src/@core/context/jobsDataContext'
import { API_BASE_URL } from 'src/configs/apiConfig'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useAuth } from 'src/@core/context/authContext'

interface FilterValue {
  [key: string]: string
}

interface Column {
  field:
  | 'site'
  | 'title'
  | 'is_easy_apply'
  | 'is_remote'
  | 'company'
  | 'location'
  | 'job_type'
  | 'salary'
  | 'date_posted'
  headerName: string
  minWidth?: number
}

interface AnalyzeResultRow {
  title: string
  profile: string
  score: number
}

const columns: readonly GridColDef[] = [
  { field: 'site', headerName: 'Site', minWidth: 100 },
  {
    field: 'title',
    headerName: 'Title',
    minWidth: 200,
    renderCell: params => (
      <Link href={params.row.job_url_direct || params.row.job_url || '#'} passHref>
        <a target='_blank' rel='noopener noreferrer'>
          {params.row.title}
        </a>
      </Link>
    )
  },
  { field: 'is_easy_apply', headerName: 'Easy Apply', minWidth: 50 },
  { field: 'is_remote', headerName: 'Remote', minWidth: 50 },
  {
    field: 'company',
    headerName: 'Company',
    minWidth: 170
  },
  {
    field: 'location',
    headerName: 'Location',
    minWidth: 170
  },
  {
    field: 'job_type',
    headerName: 'Job Type',
    minWidth: 170
  },
  {
    field: 'salary',
    headerName: 'Salary',
    minWidth: 170
  },
  {
    field: 'date_posted',
    headerName: 'Date Posted',
    minWidth: 170
  }
]

const analyzeResultColumns = [
  {
    field: 'title',
    headerName: 'Job Title',
    minWidth: 250
  },
  {
    field: 'profile',
    headerName: 'Best Matched Profile',
    minWidth: 400
  },
  {
    field: 'score',
    headerName: 'Score',
    minWidth: 50
  }
]

const initialFilterValue = {
  site: '',
  title: '',
  is_easy_apply: '',
  is_remote: ''
}

function Pagination({
  page,
  onPageChange,
  className
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
  const apiRef = useGridApiContext()
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  return (
    <MuiPagination
      color='primary'
      className={className}
      count={pageCount}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1)
      }}
    />
  )
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />
}

const Jobs = () => {
  // ** States
  const { jobsData, setJobsData, count, setCount } = useJobsData()
  const [analyzeResultRows, setAnalyzeResultRows] = useState<AnalyzeResultRow[]>([])
  const [filterValue, setFilterValue] = useState<FilterValue>(initialFilterValue)
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 })
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const [deleteAllConfirm, setDeleteAllConfirm] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [analyzeLoading, setAnalyzeLoading] = useState<boolean>(false)
  const [isModalOpen, setModalOpen] = useState<boolean>(false)

  const { token } = useAuth()

  useEffect(() => {
    fetchJobs(filterValue, sortModel, paginationModel)
  }, [])

  const fetchJobs = async (
    filterValue: FilterValue,
    sortModel: GridSortModel,
    paginationModel: GridPaginationModel
  ) => {
    try {
      const params = new URLSearchParams()

      /**
       * Add filer parameters to the query string
       *  */
      const filterParams: string[] = []

      Object.keys(filterValue).forEach((field: string) => {
        if (filterValue[field].trim() !== '') {
          if (field === 'is_remote' || field === 'is_easy_apply') {
            filterParams.push(`${field}:${filterValue[field] === 'Yes' ? 't' : filterValue[field] === 'No' ? 'f' : ''}`)
          } else {
            filterParams.push(`${field}:${filterValue[field]}`)
          }
        }
      })

      if (filterParams.length > 0) {
        params.append('filters', filterParams.join(','))
      }

      /**
       * Add sort parameters to the query string
       *  */
      sortModel.forEach(item => {
        params.append('sort', `${item.field}:${item.sort}`)
      })

      setLoading(true)

      console.log(token);
      const response = await Axios.get(
        `${API_BASE_URL}/job/scrape/?page=${paginationModel.page + 1}&${params.toString()}`)

      setLoading(false)
      setJobsData(response.data.results)
      setCount(response.data.count)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  async function handleDeleteSelectedJobPosts(): Promise<void> {
    try {
      const response = await Axios.delete<DeleteJobPostsResponse>(`${API_BASE_URL}/job/delete-selected/`, {
        data: {
          ids: rowSelectionModel
        }
      });

      console.log(response.data.message);
    } catch (error) {
      if (Axios.isAxiosError(error) && error.response) {
        console.error('Failed to delete job posts', error.response.statusText);
      } else {
        console.error('Failed to delete job posts', error);
      }
    }
  }

  async function handleDeleteAllJobPosts(): Promise<void> {
    try {
      const response: AxiosResponse<DeleteJobPostsResponse> = await Axios.delete(`${API_BASE_URL}/job/scrape/`);

      console.log(response.data.message);
    } catch (error) {
      // Handle error
      if (Axios.isAxiosError(error)) {
        console.error('Failed to delete job posts', error.response ? error.response.statusText : error.message);
      } else {
        console.error('An unexpected error occurred', error);
      }
    }

    fetchJobs(filterValue, sortModel, paginationModel);
    setDeleteAllConfirm(false);
  }

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel)
    fetchJobs(filterValue, newSortModel, paginationModel)
  }

  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel)
    fetchJobs(filterValue, sortModel, newPaginationModel)
  }

  const handleRowSelectionModelChange = (newRowSelectionModel: GridRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel)
  }

  const handleChangeFilter = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue({
      ...filterValue,
      [prop]: event.target.value
    })
  }

  const handleKeyDown = (prop: keyof FilterValue) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      fetchJobs(filterValue, sortModel, paginationModel)
    }
  }

  const handleAnalyze = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    try {
      setAnalyzeLoading(true)
      const response = await Axios.post(
        `${API_BASE_URL}/job/analyze/`,
        { jobs: rowSelectionModel },
        {
          headers: {
            Authorization: 'Token ' + token
          }
        }
      )
      setAnalyzeResultRows(
        Object.keys(response.data.results).map(jobId => ({
          id: jobId,
          title: response.data.results[jobId].job_title,
          profile: response.data.results[jobId].top_profile.recent_role,
          score: response.data.results[jobId].max_score * 100
        }))
      )
      setModalOpen(true)
      setAnalyzeLoading(false)
    } catch (error) {
      console.log(error)
      setAnalyzeLoading(false)
    }
  }

  const rows = jobsData.map(job => ({
    ...job,
    is_easy_apply: job.is_easy_apply ? 'Yes' : 'No',
    is_remote: job.is_remote === null ? 'N/A' : job.is_remote ? 'Yes' : 'No',
    salary:
      job.min_amount && job.max_amount && job.interval
        ? job.min_amount + '-' + job.max_amount + job.currency + '/' + job.interval
        : 'N/A',
    title: (
      <Link href={job.job_url_direct || job.job_url || '#'} passHref>
        <a target='_blank' rel='noopener noreferrer'>
          {job.title}
        </a>
      </Link>
    )
  }))

  // Modal reference
  const descriptionElementRef = React.useRef<HTMLElement>(null)
  useEffect(() => {
    if (isModalOpen) {
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [isModalOpen])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item container xs={8}>
          <Grid item xs={12} sm={3}>
            <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <TextField
                size='small'
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                placeholder='Site search'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Magnify fontSize='small' />
                    </InputAdornment>
                  )
                }}
                value={filterValue.site}
                onChange={handleChangeFilter('site')}
                onKeyDown={handleKeyDown('site')}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <TextField
                size='small'
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                placeholder='Job title search'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Magnify fontSize='small' />
                    </InputAdornment>
                  )
                }}
                value={filterValue.title}
                onChange={handleChangeFilter('title')}
                onKeyDown={handleKeyDown('title')}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <TextField
                size='small'
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                placeholder='Easy Apply Yes/No'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Magnify fontSize='small' />
                    </InputAdornment>
                  )
                }}
                value={filterValue.is_easy_apply}
                onChange={handleChangeFilter('is_easy_apply')}
                onKeyDown={handleKeyDown('is_easy_apply')}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <TextField
                size='small'
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                placeholder='Remote search Yes/No'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Magnify fontSize='small' />
                    </InputAdornment>
                  )
                }}
                value={filterValue.is_remote}
                onChange={handleChangeFilter('is_remote')}
                onKeyDown={handleKeyDown('is_remote')}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid item container xs={4} justifyContent='flex-end' gap={1}>
          <Button variant='contained' size='small' onClick={handleDeleteSelectedJobPosts}>
            Delete Selected
          </Button>
          <Button variant='contained' size='small' onClick={() => setDeleteAllConfirm(true)}>
            Delete All
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            rows={rows}
            columns={columns}
            sortingMode='server'
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            paginationMode='server'
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={count}
            loading={loading}
            slots={{
              pagination: CustomPagination
            }}
            checkboxSelection
            disableRowSelectionOnClick
            keepNonExistentRowsSelected
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={handleRowSelectionModelChange}
            autoHeight
          />
        </Grid>
        <Grid item xs={12}>
          {rowSelectionModel.length > 0 && (
            <LoadingButton loading={analyzeLoading} variant='contained' onClick={handleAnalyze}>
              Recommend the best profile for the selected jobs
            </LoadingButton>
          )}
        </Grid>
      </Grid>
      <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} scroll='paper' maxWidth='md'>
        <DialogTitle id='scroll-dialog-title'>Here are best profiles for given jobs.</DialogTitle>
        <DialogContent dividers>
          <DialogContentText id='scroll-dialog-description' ref={descriptionElementRef} tabIndex={-1}>
            <DataGrid rows={analyzeResultRows} columns={analyzeResultColumns} hideFooter />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteAllConfirm} onClose={() => setDeleteAllConfirm(false)} scroll='paper' maxWidth='md'>
        <DialogTitle id='scroll-dialog-title'>Please confirm the deletion of all jobs.</DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteAllJobPosts}>Confirm</Button>
          <Button color='error' onClick={() => setDeleteAllConfirm(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Jobs
