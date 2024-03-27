// ** React Imports
import { useState,forwardRef } from 'react'
import Axios from 'axios'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import { useProfileData } from 'src/@core/context/profileDataContext'
import { useAuth } from 'src/@core/context/authContext'
import { CircularProgress } from '@mui/material'

const TabInfo = () => {
  // ** State
  const {profileData, setProfileData} = useProfileData();
  const [isLoading, setLoading] = useState<boolean>(false);

  const {token, isAuthenticated} = useAuth();

  const handleChange = (prop: string) => (event:React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [prop]: event.target.value
    })
  }

  const handleReset = () => {
    setProfileData({
      ...profileData,
      github: '',
      linkedin: '',
      website: ''
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      console.log(profileData)
      const response = await Axios.post('http://localhost:8000/profile/create/', profileData, {
        headers: {
          Authorization: 'Token ' + token
        }
      })
      
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  return (
    <CardContent sx={{marginTop: 4.75}}>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Linkedin' placeholder='www.linkedin.com/in/john-doe' value={profileData.linkedin} onChange={handleChange('linkedin')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Github' placeholder='www.github.com/john-doe' value={profileData.github} onChange={handleChange('github')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Website'
              placeholder='https://example.com/'
              value={profileData.website}
              onChange={handleChange('website')}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmit}>
              {isLoading ? <CircularProgress size={26} sx={{color: 'white'}}/>: "Save Changes"}
            </Button>
            <Button type='reset' variant='outlined' color='secondary' onClick={handleReset}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default TabInfo
