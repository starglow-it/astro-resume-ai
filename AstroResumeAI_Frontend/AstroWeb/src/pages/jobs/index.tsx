// ** React Imports
import { useState, ChangeEvent, useEffect } from 'react'
import Link from 'next/link'
// ** Axios Imports
import Axios from 'axios'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import {
  DataGrid,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
  GridPagination,
  useGridApiContext,
  gridPageCountSelector,
  useGridSelector,
  GridColDef,
  GridRenderCellParams
} from '@mui/x-data-grid'
import { ConsoleLine } from 'mdi-material-ui'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'

import { useJobsData } from 'src/@core/context/jobsDataContext'
import { API_BASE_URL } from 'src/configs/apiConfig'

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

const columns: readonly GridColDef[] = [
  { field: 'site', headerName: 'Site', minWidth: 100 },
  {
    field: 'title',
    headerName: 'Title',
    minWidth: 100,
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

interface Data {
  site: string
  title: string
  is_easy_apply: boolean
  is_remote: boolean
  company: string
  location: string
  job_type: string
  salary: string
  date_posted: string
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
  // const [page, setPage] = useState<number>(0)
  const { jobsData, setJobsData, count, setCount, pageNumber, setPageNumber } = useJobsData()

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 })
  const [loading, setLoading] = useState<boolean>(false)

  // const handleChangePage = (event: unknown, newPage: number) => {
  //   const targetPage = newPage + 1
  //   setPageNumber(targetPage)
  //   fetchJobs(targetPage)
  // }

  useEffect(() => {
    fetchJobs(filterModel, sortModel, paginationModel)
  }, [])

  const fetchJobs = async (
    filterModel: GridFilterModel,
    sortModel: GridSortModel,
    paginationModel: GridPaginationModel
  ) => {
    try {
      const params = new URLSearchParams()
      if (filterModel.items.length > 0) {
        let filterParams: string[] = []

        filterModel.items.forEach(item => {
          if (item.field === 'is_easy_apply' || item.field === 'is_remote') {
            if (item.value === 'Yes') {
              item.value = 't'
            } else {
              item.value = 'f'
            }
          }

          filterParams.push(`${item.field}:${item.value}`)
        })

        params.append('filters', filterParams.join(','))
      }

      sortModel.forEach(item => {
        params.append('sort', `${item.field}:${item.sort}`)
      })

      console.log('PARAMS: ', params.toString())

      setLoading(true)
      const response = await Axios.get(
        `${API_BASE_URL}/job/scrape/?page=${paginationModel.page + 1}&${params.toString()}`
      )

      setLoading(false)
      setJobsData(response.data.results)
      setCount(response.data.count)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const handleFilterModelChange = (newFilterModel: GridFilterModel) => {
    console.log('NEW FILTER MODEL: ', newFilterModel)

    // // Create a new filter model by merging old and new filters
    // const updatedFilterItems = [...filterModel.items]

    // newFilterModel.items.forEach(newItem => {
    //   const index = updatedFilterItems.findIndex(item => item.field === newItem.field)
    //   if (index > -1) {
    //     // Update existing filter
    //     updatedFilterItems[index] = newItem
    //   } else {
    //     // Add new filter if it doesn't already exist
    //     updatedFilterItems.push(newItem)
    //   }
    // })

    // const updatedFilterModel = {
    //   ...filterModel,
    //   items: updatedFilterItems
    // }

    // if (JSON.stringify(newFilterModel.items) !== JSON.stringify(filterModel.items)) {
    //   setFilterModel(updatedFilterModel)
    //   fetchJobs(newFilterModel, sortModel, paginationModel)
    // }
    setFilterModel(newFilterModel)
    fetchJobs(newFilterModel, sortModel, paginationModel)
  }

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    console.log('NEW SORT MODEL: ', newSortModel)
    setSortModel(newSortModel)
    fetchJobs(filterModel, newSortModel, paginationModel)
  }

  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    console.log('NEW PAGINATION MODEL: ', newPaginationModel)
    setPaginationModel(newPaginationModel)
    fetchJobs(filterModel, sortModel, newPaginationModel)
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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          columns={columns}
          filterMode='server'
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
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
        />
      </Grid>
    </Grid>
  )
}

export default Jobs
