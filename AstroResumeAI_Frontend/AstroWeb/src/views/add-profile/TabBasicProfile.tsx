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

// Import types
import { ProfileData } from 'src/types/ProfileData'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import { API_BASE_URL } from 'src/configs/apiConfig'

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

interface TabBasicProfileProps {
  handleSetTab: (tab: string) => void
}

const TabBasicProfile: React.FC<TabBasicProfileProps> = ({ handleSetTab }) => {
  // ** State
  const [openAlert, setOpenAlert] = useState<boolean>(true)
  const [fileName, setFileName] = useState<string>('')
  const [uploadTime, setUploadTime] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { profileData, setProfileData } = useProfileData()

  const onFileChange = async (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setIsLoading(true) // Start Loading

      const file = files[0]

      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await axios.post(`${API_BASE_URL}/parse-resume/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        setProfileData(response.data)

        setIsLoading(false)
        setFileName(file.name)
        setUploadTime(new Date().toLocaleString())
      } catch (error) {
        console.log(error)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleChange = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [prop]: event.target.value
    })
  }

  const handleReset = () => {
    setProfileData({
      ...profileData,
      name: '',
      email: '',
      recent_role: '',
      location: '',
      phone: '',
      summary: ''
    })
  }

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src='/images/ocr.svg' alt='Resume Pic' />
              <Box>
                <ButtonStyled component='label' variant='contained' htmlFor='add-profile-upload-resume'>
                  Upload Resume
                  <input
                    hidden
                    type='file'
                    onChange={onFileChange}
                    accept='application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword'
                    id='add-profile-upload-resume'
                  />
                </ButtonStyled>
                {isLoading ? (
                  <LinearProgress sx={{ marginTop: 5 }} />
                ) : (
                  <Typography variant='body2' sx={{ marginTop: 5 }}>
                    {fileName ? (
                      <>
                        {fileName} <br /> {'Uploaded at ' + uploadTime}
                      </>
                    ) : (
                      'Allowed PDF, DOCX, DOC or TXT.'
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Name'
              placeholder='John Doe'
              value={profileData.name}
              onChange={handleChange('name')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel sx={{ fontSize: '0.875rem' }}>Gender</FormLabel>
              <RadioGroup row defaultValue='male' aria-label='gender' name='account-settings-info-radio'>
                <FormControlLabel value='male' label='Male' control={<Radio />} />
                <FormControlLabel value='female' label='Female' control={<Radio />} />
                <FormControlLabel value='other' label='Other' control={<Radio />} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='Email'
              placeholder='johnDoe@example.com'
              value={profileData.email}
              onChange={handleChange('email')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Recent Role'
              placeholder='Senior Full Stack Developer'
              value={profileData.recent_role}
              onChange={handleChange('recent_role')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='text'
              label='Location'
              placeholder='New York, NY'
              value={profileData.location}
              onChange={handleChange('location')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='text'
              label='Phone'
              placeholder='+1 234 567 8900'
              value={profileData.phone}
              onChange={handleChange('phone')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              type='text'
              label='Summary'
              value={profileData.summary}
              onChange={handleChange('summary')}
            />
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
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => handleSetTab('skills')}>
              Next
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

export default TabBasicProfile
