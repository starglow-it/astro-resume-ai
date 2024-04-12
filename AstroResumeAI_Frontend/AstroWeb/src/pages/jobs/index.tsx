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
import { useJobsData } from 'src/@core/context/jobsDataContext'
import { API_BASE_URL } from 'src/configs/apiConfig'

interface Column {
  id: 'site' | 'title' | 'is_easy_apply' | 'is_remote' | 'company' | 'location' | 'job_type' | 'salary' | 'date_posted'
  label: string
  minWidth?: number
}

const columns: readonly Column[] = [
  { id: 'site', label: 'Site', minWidth: 100 },
  { id: 'title', label: 'Title', minWidth: 100 },
  { id: 'is_easy_apply', label: 'Easy Apply', minWidth: 50 },
  { id: 'is_remote', label: 'Remote', minWidth: 50 },
  {
    id: 'company',
    label: 'Company',
    minWidth: 170
  },
  {
    id: 'location',
    label: 'Location',
    minWidth: 170
  },
  {
    id: 'job_type',
    label: 'Job Type',
    minWidth: 170
  },
  {
    id: 'salary',
    label: 'Salary',
    minWidth: 170
  },
  {
    id: 'date_posted',
    label: 'Date Posted',
    minWidth: 170
  }
]

interface Data {
  site: string
  title: string
  company: string
  location: string
  job_type: string
  salary: string
  date_posted: string
}

const Jobs = () => {
  // ** States
  const [page, setPage] = useState<number>(0)
  const { jobsData, setJobsData, count, setCount, pageNumber, setPageNumber } = useJobsData()

  const handleChangePage = (event: unknown, newPage: number) => {
    const targetPage = newPage + 1

    setPageNumber(targetPage)
    fetchJobs(targetPage)
  }

  useEffect(() => {
    fetchJobs(pageNumber)
  }, [])

  const fetchJobs = async (pageNumber: number) => {
    try {
      const response = await Axios.get(`${API_BASE_URL}/job/scrape/?page=${pageNumber}`)

      setJobsData(response.data.results)
      setCount(response.data.count)
    } catch (error) {
      console.log(error)
    }
  }

  const slotProps = {
    action: {
      nextButton: () => {
        console.log('next')
      }
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
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
                              <Link passHref href={row.job_url_direct || row.job_url} replace>
                                {row.title}
                              </Link>
                            )
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
      </Grid>
    </Grid>
  )
}

export default Jobs
