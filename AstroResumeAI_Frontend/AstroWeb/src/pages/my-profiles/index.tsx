// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Demo Components Imports
import CardProfile from 'src/views/cards/CardProfile'

const CardBasic = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CardProfile />
      </Grid>
      <Grid item xs={12}>
        <CardProfile />
      </Grid>
    </Grid>
  )
}

export default CardBasic
