import Grid from '@mui/material/Grid'
import AutoBidAnswers from 'src/views/auto-bid-answers/AutoBidAnswers'

import 'react-datepicker/dist/react-datepicker.css'

const FormLayouts = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AutoBidAnswers />
      </Grid>
    </Grid>
  )
}

export default FormLayouts
