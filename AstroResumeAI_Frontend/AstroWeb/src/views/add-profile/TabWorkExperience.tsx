// ** React Imports
import { useState, ElementType, ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button, { ButtonProps } from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'

//  ** Axios Import
import axios from 'axios'

// Context API
import { useProfileData } from 'src/@core/context/profileDataContext'

interface ProfileData {
  name: string,
  email: string,
  phone: string,
  location: string,
  skills: string[],
  summary: string
}

const initialProfileData: ProfileData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  skills: [],
  summary: ''
};

const ImgStyled = styled('img')(({ theme }) => ({
  width: 80,
  height: 80,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const TabWorkExperience = () => {
  // ** State
  const [openAlert, setOpenAlert] = useState<boolean>(true)

  const {profileData, setProfileData} = useProfileData();

  const handleChange = (index: number, prop: keyof typeof profileData.experience[number]) => (event: React.ChangeEvent<HTMLInputElement>)=> {
    const updatedExperience = [...profileData.experience]

    updatedExperience[index] = { ...updatedExperience[index], [prop]: event.target.value }

    setProfileData({
      ...profileData,
      experience: updatedExperience
    })
  }

  const addExperience = () => {
    const updatedExperience = [...profileData.experience];

    updatedExperience.push({
      job_title: '',
      company: '',
      duration: '',
      location: '',
      description: ""
    })

    setProfileData({
      ...profileData,
      experience: updatedExperience
    })
  }

  const deleteExperience = (index: number) => {
    const updatedExperience = [...profileData.experience]

    updatedExperience.splice(index, 1);

    setProfileData({
      ...profileData,
      experience: updatedExperience
    })
  }

  return (
    <CardContent>
      <form>
        {profileData.experience.map((exp, index) => 
          <Grid container spacing={7} sx={{marginBottom: 10}} key={index}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Job Title' placeholder='Full stack developer' value={exp.job_title} onChange = {handleChange(index, 'job_title')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Company Name'
                  placeholder='ABC Company'
                  value={exp.company}
                  onChange = {handleChange(index, 'company')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='text'
                  label='Job Location'
                  placeholder='New York, NY'
                  value={exp.location}
                  onChange = {handleChange(index, 'location')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='text'
                  label='Duration'
                  placeholder='2020 Feb - 2024 March'
                  value={exp.duration}
                  onChange = {handleChange(index, 'duration')}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={5}
                  type='text'
                  label='Description'
                  value={exp.description}
                  onChange = {handleChange(index, 'description')}
                />
              </Grid>

              <Grid item xs={12} container justifyContent="flex-end">
                  <Button variant='outlined' size="small" onClick={() => deleteExperience(index)}>
                    Delete
                  </Button>
              </Grid>
            </Grid>  
          )}
          
          <Grid item xs={12} sx={{marginBottom: 5}}>
            <Button variant="outlined" onClick={addExperience}>
              Add Experience
            </Button>
          </Grid>

          {/* {openAlert ? (
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Alert
                severity='warning'
                sx={{ '& a': { fontWeight: 400 } }}
                action={
                  <IconButton size='small' color='inherit' aria-label='close' onClick={() => setOpenAlert(false)}>
                    <Close fontSize='inherit' />
                  </IconButton>
                }
              >
                <AlertTitle>Your email is not confirmed. Please check your inbox.</AlertTitle>
                <Link href='/' onClick={(e: SyntheticEvent) => e.preventDefault()}>
                  Resend Confirmation
                </Link>
              </Alert>
            </Grid>
          ) : null} */}

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary' >
              Reset
            </Button>
          </Grid>
      </form>
    </CardContent>
  )
}

export default TabWorkExperience;
