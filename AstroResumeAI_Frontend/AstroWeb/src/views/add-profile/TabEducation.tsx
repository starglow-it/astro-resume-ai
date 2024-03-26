// ** React Imports
import { useState, ElementType, ChangeEvent } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import Button, { ButtonProps } from '@mui/material/Button'

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

interface TabEducationProps {
  handleSetTab: (tab: string) => void
}

const TabEducation: React.FC<TabEducationProps> = ({handleSetTab}) => {
  // ** State
  const [openAlert, setOpenAlert] = useState<boolean>(true)

  const {profileData, setProfileData} = useProfileData();

  const handleChange = (index: number, prop: keyof typeof profileData.education[number]) => (event: React.ChangeEvent<HTMLInputElement>)=> {
    const updatedEducation = [...profileData.education]

    updatedEducation[index] = { ...updatedEducation[index], [prop]: event.target.value }

    setProfileData({
      ...profileData,
      education: updatedEducation
    })
  }

  const addEducation = () => {
    const updatedEducation = [...profileData.education];

    updatedEducation.push({
      university: '',
      education_level: '',
      major: '',
      graduation_year: ''
    })

    setProfileData({
      ...profileData,
      education: updatedEducation
    })
  }

  const deleteEducation = (index: number) => {
    const updatedEducation = [...profileData.education]

    updatedEducation.splice(index, 1);

    setProfileData({
      ...profileData,
      education: updatedEducation
    })
  }

  const handleReset = () => {
    setProfileData({
      ...profileData,
      education: []
    })
  }

  return (
    <CardContent sx={{marginTop: 4.75}}>
      <form>
        {profileData.education.map((edu, index) => 
          <Grid container spacing={7} sx={{marginBottom: 10}} key={index}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='University/College' placeholder='ABC University' value={edu.university} onChange = {handleChange(index, 'university')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Education Level'
                  placeholder="Master's degree"
                  value={edu.education_level}
                  onChange = {handleChange(index, 'education_level')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='text'
                  label='Graduation Year'
                  placeholder='December, 2015'
                  value={edu.graduation_year}
                  onChange = {handleChange(index, 'graduation_year')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='text'
                  label='Major Study Field'
                  placeholder='Computer Science'
                  value={edu.major}
                  onChange = {handleChange(index, 'major')}
                />
              </Grid>
              
              <Grid item xs={12} container justifyContent="flex-end">
                  <Button variant='outlined' size="small" onClick={() => deleteEducation(index)}>
                    Delete
                  </Button>
              </Grid>
            </Grid>  
          )}
          
          <Grid item xs={12} sx={{marginBottom: 5}}>
            <Button variant="outlined" onClick={addEducation}>
              Add Education
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
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => handleSetTab('info')}>
              Next
            </Button>
            <Button type='reset' variant='outlined' color='secondary' onClick={handleReset}>
              Reset
            </Button>
          </Grid>
      </form>
    </CardContent>
  )
}

export default TabEducation;
