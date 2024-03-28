// ** React Imports
import { SyntheticEvent, useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab, { TabProps } from '@mui/material/Tab'

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import WorkIcon from '@mui/icons-material/Work'
import SchoolIcon from '@mui/icons-material/School'

// ** Demo Tabs Imports
import TabInfo from 'src/views/add-profile/TabInfo'
import TabBasicProfile from 'src/views/add-profile/TabBasicProfile'
import TabWorkExperience from 'src/views/add-profile/TabWorkExperience'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'
import TabEducation from 'src/views/add-profile/TabEducation'
import withAuth from 'src/@core/components/withAuth'
import { useProfileData } from 'src/@core/context/profileDataContext'
import { useRouter } from 'next/router'

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

const EditProfile = () => {
  // ** State
  const [value, setValue] = useState<string>('basic_profile')

  const router = useRouter()

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const handleSetTab = (tab: string): void => {
    setValue(tab)
  }

  const { profileData, profileList, setProfileData } = useProfileData()

  useEffect(() => {
    var { profileId } = router.query

    console.log('profileId', profileId)

    const selectedProfile = profileList.find(profile => profile.id.toString() === profileId)

    if (selectedProfile && selectedProfile.id) {
      var { id, ...updatedProfile } = selectedProfile

      console.log(updatedProfile)

      setProfileData(updatedProfile)
    }
  }, [])

  return (
    <Card>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='add-profile tabs'
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            value='basic_profile'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountOutline />
                <TabName>Basic Profile</TabName>
              </Box>
            }
          />
          <Tab
            value='work_experience'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon />
                <TabName>Work Experience</TabName>
              </Box>
            }
          />
          <Tab
            value='education'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon />
                <TabName>Education</TabName>
              </Box>
            }
          />
          <Tab
            value='info'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InformationOutline />
                <TabName>Links & Save</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value='basic_profile'>
          <TabBasicProfile handleSetTab={handleSetTab} />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='work_experience'>
          <TabWorkExperience handleSetTab={handleSetTab} />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='education'>
          <TabEducation handleSetTab={handleSetTab} />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='info'>
          <TabInfo isUpdate={true} />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default withAuth(EditProfile)
