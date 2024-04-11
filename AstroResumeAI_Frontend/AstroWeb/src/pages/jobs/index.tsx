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
import { DataGrid, GridSortModel, GridFilterModel, GridPaginationModel } from '@mui/x-data-grid'

import { useJobsData } from 'src/@core/context/jobsDataContext'
import { API_BASE_URL } from 'src/configs/apiConfig'
import { ConsoleLine } from 'mdi-material-ui'

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

const columns: readonly Column[] = [
  { field: 'site', headerName: 'Site', minWidth: 100 },
  { field: 'title', headerName: 'Title', minWidth: 100 },
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

const Jobs = () => {
  // ** States
  // const [page, setPage] = useState<number>(0)
  const { jobsData, setJobsData, count, setCount, pageNumber, setPageNumber } = useJobsData()

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 })

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
      const filterParams = new URLSearchParams()
      filterModel.items.forEach(item => {
        filterParams.append(item.field, item.value)
      })

      const sortParams = new URLSearchParams()
      sortModel.forEach(item => {
        sortParams.append('sort', `${item.field},${item.sort}`)
      })

      const response = await Axios.get(
        `${API_BASE_URL}/job/scrape/?page=${
          paginationModel.page + 1
        }&${filterParams.toString()}&${sortParams.toString()}`
      )

      setJobsData(response.data.results)
      setCount(response.data.count)
    } catch (error) {
      console.log(error)
    }
  }

  const handleFilterModelChange = (newFilterModel: GridFilterModel) => {
    console.log('NEW FILTER MODEL: ', newFilterModel)
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

  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <Card>
          <CardHeader title='Jobs Scraped' titleTypographyProps={{ variant: 'h6' }} />
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 650 }}>
              <Table stickyHeader aria-label='sticky table'>
                <TableHead>
                  <TableRow>
                    {columns.map(column => (
                      <TableCell key={column.id} align='right' sx={{ minWidth: column.minWidth }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobsData.map(row => {
                    return (
                      <TableRow hover role='checkbox' tabIndex={-1} key={row.id}>
                        {columns.map(column => {
                          var value

                          if (column.id === 'salary') {
                            value =
                              row.currency && row.min_amount && row.max_amount
                                ? '' + row.currency + row.min_amount + '-' + row.max_amount + ' ' + row.interval
                                : null
                          } else if (column.id === 'title') {
                            value = (
                              <Link passHref href={row.job_url_direct || row.job_url || '#'} replace>
                                {row.title}
                              </Link>
                            )
                          } else if (column.id === 'is_easy_apply' || column.id === 'is_remote') {
                            value = row[column.id] ? 'Yes' : 'No'
                          } else {
                            value = row[column.id]
                          }

                          return (
                            <TableCell key={column.id} align='right'>
                              {value}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[20]}
              component='div'
              count={count}
              rowsPerPage={20}
              page={pageNumber - 1}
              onPageChange={handleChangePage}
            />
          </Paper>
        </Card>
      </Grid> */}

      <Grid item xs={12}>
        <DataGrid
          rows={jobsData}
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
        />
      </Grid>
    </Grid>
  )
}

export default Jobs
