// ** React Imports
import { SyntheticEvent, useState } from 'react'

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
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'

// ** Demo Tabs Imports
import TabInfo from 'src/views/add-profile/TabInfo'
import TabBasicProfile from 'src/views/add-profile/TabBasicProfile'
import TabWorkExperience from 'src/views/add-profile/TabWorkExperience'
import TabSecurity from 'src/views/add-profile/TabSecurity'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'
import TabEducation from 'src/views/add-profile/TabEducation'

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

const AddProfile = () => {
  // ** State
  const [value, setValue] = useState<string>('basic_profile')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

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
                <AccountOutline />
                <TabName>Work Experience</TabName>
              </Box>
            }
          />
          <Tab
            value='education'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountOutline />
                <TabName>Education</TabName>
              </Box>
            }
          />
          <Tab
            value='info'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InformationOutline />
                <TabName>Info</TabName>
              </Box>
            }
          />
          <Tab
            value='security'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LockOpenOutline />
                <TabName>Security</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value='basic_profile'>
          <TabBasicProfile />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='work_experience'>
          <TabWorkExperience />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='education'>
          <TabEducation />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='info'>
          <TabInfo />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='security'>
          <TabSecurity />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default AddProfile
