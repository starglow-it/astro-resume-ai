// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import TrendingUp from 'mdi-material-ui/TrendingUp'
import StarOutline from 'mdi-material-ui/StarOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'
import { FetchedProfileData  } from 'src/types/ProfileData'
import { number } from 'prop-types'
import router from 'next/router'
import { API_BASE_URL } from 'src/configs/apiConfig'

// Styled Box component
const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

interface CardProfileProps {
  profile: FetchedProfileData,
  editProfile: (index: string) => void,
  deleteProfile: (index: string) => void, 
}

const CardProfile: React.FC<CardProfileProps> = ({profile, editProfile, deleteProfile}) => {
  return (
    <Card>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={7}>
          <CardContent sx={{ padding: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}>
            <Typography variant='h6' sx={{ marginBottom: 3.5 }}>
              {profile.name}
            </Typography>
            <Typography variant='body2'>
              {profile.summary}
            </Typography>
            <Divider sx={{ marginTop: 6.5, marginBottom: 6.75 }} />
            <Grid container spacing={4}>
              <Grid item xs={12} sm={5}>
                <StyledBox>
                  <Box sx={{ mb: 6.75, display: 'flex', alignItems: 'center' }}>
                    <LockOpenOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                    <Typography variant='body2'>{profile.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                    <Typography variant='body2'>{profile.recent_role}</Typography>
                  </Box>
                </StyledBox>
              </Grid>
              <Grid item xs={12} sm={7}>
                <Box sx={{ mb: 6.75, display: 'flex', alignItems: 'center' }}>
                  <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                  <Typography variant='body2'>{profile.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                  <Typography variant='body2'>{profile.phone}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
        <Grid
          item
          sm={5}
          xs={12}
          sx={{ paddingTop: ['0 !important', '1.5rem !important'], paddingLeft: ['1.5rem !important', '0 !important'] }}
        >
          <CardContent
            sx={{
              height: '100%',
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              padding: theme => `${theme.spacing(18, 5, 16)} !important`
            }}
          >
            <Box>
              <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <Typography variant='h6' sx={{ lineHeight: 1, fontWeight: 600, fontSize: '2.75rem !important' }}>
                  {profile.name}
                </Typography>                
              </Box>
              <Typography variant='body2' sx={{ mb: 13.75, display: 'flex', flexDirection: 'column' }}>
                <span>{profile.summary}</span>
              </Typography>
              <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Button variant='outlined' size='small' onClick={() => editProfile(profile.id)} sx={{marginRight: 5}}>Edit</Button>
                <Button variant='contained' size='small' onClick={() => deleteProfile(profile.id)}>Delete</Button>
              </Box>
            </Box>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default CardProfile
