// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component
// import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Demo Components Imports
import FormLayoutsSeparator from 'src/views/job-scraping/JobScrapingInput'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

const FormLayouts = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <FormLayoutsSeparator />
      </Grid>
    </Grid>
  )
}

export default FormLayouts
