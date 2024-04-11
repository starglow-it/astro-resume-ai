// ** React Imports
import { ChangeEvent, forwardRef, MouseEvent, useState } from 'react'

// ** Axios Import
import Axios from 'axios'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import { API_BASE_URL } from 'src/configs/apiConfig'
import { Alert, AlertTitle } from '@mui/material'
import { Close } from 'mdi-material-ui'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

interface ScrapingParams {
  site_name: string
  search_term: string
  location: string
  is_remote: boolean
  hours_old: number
  country_indeed: string
  results_wanted: number
}

interface Error {
  [key: string]: string[]
}

const JobScrapingInput = () => {
  const initialValues = {
    site_name: '',
    search_term: '',
    location: '',
    is_remote: false,
    hours_old: 0,
    country_indeed: '',
    results_wanted: 0
  }
  // ** States
  const [values, setValues] = useState<ScrapingParams>(initialValues)
  const [message, setMessage] = useState<string>('')

  const [error, setError] = useState<Error>({})
  const [alertIsOpen, setAlertOpen] = useState<boolean>(false)

  // Handle Input
  const handleChange = (prop: keyof ScrapingParams) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  // Handle Select
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    // if (typeof event.target.value === 'string') {
    //   setValues({ ...values, site_name: [event.target.value] })
    // } else {
    setValues({ ...values, site_name: event.target.value })
    // }
  }

  const handleIsRemote = (event: SelectChangeEvent<number>) => {
    setValues({ ...values, is_remote: !!event.target.value })
  }

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    console.log(values)

    try {
      const response = await Axios.post(`${API_BASE_URL}/job/scrape/`, values)

      setMessage(response.data.message)
      setAlertOpen(true)
    } catch (error) {
      if (Axios.isAxiosError(error) && error.response) {
        setError(error.response.data)
      } else {
        console.log(error)
      }
    }
  }

  const handleReset = () => {
    setValues(initialValues)
  }

  return (
    <Card>
      <CardHeader title='Job Scraping Input' titleTypographyProps={{ variant: 'h6' }} />
      <Divider sx={{ margin: 0 }} />
      <form onSubmit={e => e.preventDefault()}>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                1. Job Scraping Parameters
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='form-layouts-separator-multiple-select-label'>Site Name</InputLabel>
                <Select
                  // multiple
                  value={values.site_name}
                  onChange={handleSelectChange}
                  id='form-layouts-separator-multiple-select'
                  labelId='form-layouts-separator-multiple-select-label'
                  input={<OutlinedInput label='Site Name' id='select-multiple-language' />}
                >
                  <MenuItem value='linkedin'>Linkedin</MenuItem>
                  <MenuItem value='indeed'>Indeed</MenuItem>
                  <MenuItem value='glassdoor'>Glassdoor</MenuItem>
                  <MenuItem value='zip_recruiter'>ZipRecuiter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Search Term'
                placeholder='python'
                value={values.search_term}
                onChange={handleChange('search_term')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Location'
                placeholder='United States'
                value={values.location}
                onChange={handleChange('location')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Country (Indeed)'
                placeholder='USA'
                value={values.country_indeed}
                onChange={handleChange('country_indeed')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type='number'
                fullWidth
                label='How many hours old'
                placeholder='24'
                value={values.hours_old}
                onChange={handleChange('hours_old')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type='number'
                fullWidth
                label='Desired result numbers'
                placeholder='100'
                value={values.results_wanted}
                onChange={handleChange('results_wanted')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='form-layouts-separator-select-label'>Is Remote</InputLabel>
                <Select
                  label='Is Remote'
                  defaultValue={1}
                  id='form-layouts-separator-select'
                  labelId='form-layouts-separator-select-label'
                  value={values.is_remote ? 1 : 0}
                  onChange={handleIsRemote}
                >
                  <MenuItem value={1}>Yes</MenuItem>
                  <MenuItem value={0}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ marginBottom: 0 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                2. Status
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {alertIsOpen ? (
                <Alert
                  severity='success'
                  sx={{ '& a': { fontWeight: 400 } }}
                  action={
                    <IconButton size='small' color='inherit' aria-label='close' onClick={() => setAlertOpen(false)}>
                      <Close fontSize='inherit' />
                    </IconButton>
                  }
                >
                  <AlertTitle>{message}</AlertTitle>
                </Alert>
              ) : null}
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ margin: 0 }} />
        <CardActions>
          <Button size='large' sx={{ mr: 2 }} variant='contained' onClick={handleSubmit}>
            Begin scraping
          </Button>
          <Button size='large' color='secondary' variant='outlined' onClick={handleReset}>
            Reset
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default JobScrapingInput
