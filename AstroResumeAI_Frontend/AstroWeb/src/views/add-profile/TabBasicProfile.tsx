// ** React Imports
import { useState, ElementType, ChangeEvent, SyntheticEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Button, { ButtonProps } from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'

//  ** Axios Import
import axios from 'axios'

// ** Icons Imports
import Close from 'mdi-material-ui/Close'


interface ProfileData {
  name: string,
  email: string,
  phone: string,
  location: string,
  skills: string[]
}

const initialProfileData: ProfileData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  skills: []
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


const TabBasicProfile = () => {
  // ** State
  const [file, setFile] = useState<File | null>(null);
  const [openAlert, setOpenAlert] = useState<boolean>(true)
  const [fileName, setFileName] = useState<string>("")
  const [uploadTime, setUploadTime] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData)

  const onChange = async (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setIsLoading(true) // Start Loading

      const file = files[0];

      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:5000/parse-resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setProfileData(response.data);

        setIsLoading(false);
        setFileName(file.name)
        setUploadTime(new Date().toLocaleString())
      } catch (error) {
        console.log(error)
      }

      reader.readAsDataURL(file)
    }
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
                    onChange={onChange}
                    accept='application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword'
                    id='add-profile-upload-resume'
                  />
                </ButtonStyled>
                <ResetButtonStyled color='error' variant='outlined' onClick={() => { }}>
                  Reset
                </ResetButtonStyled>
                {isLoading ? <LinearProgress sx={{ marginTop: 5 }} /> : <Typography variant='body2' sx={{ marginTop: 5 }}>
                  {fileName ? <>{fileName} <br /> {"Uploaded at " + uploadTime}</> : "Allowed PDF, DOCX or DOC."}
                </Typography>}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Name' placeholder='John Doe' value={profileData.name} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='Email'
              placeholder='johnDoe@example.com'
              value={profileData.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='text'
              label='Location'
              placeholder='New York, NY'
              value={profileData.location}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='text'
              label='Phone'
              placeholder='+1 234 567 8900'
              value={profileData.phone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label='Status' defaultValue='active'>
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Company' placeholder='ABC Pvt. Ltd.' defaultValue='ABC Pvt. Ltd.' />
          </Grid>

          {openAlert ? (
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
          ) : null}

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default TabBasicProfile;
