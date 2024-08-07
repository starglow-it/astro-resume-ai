// ** Icon imports
import Login from 'mdi-material-ui/Login'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import SearchWeb from 'mdi-material-ui/SearchWeb'
import GroupIcon from '@mui/icons-material/Group'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { Work } from '@mui/icons-material'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      sectionTitle: 'Profile and Resume'
    },
    {
      title: 'My Profiles',
      icon: GroupIcon,
      path: '/my-profiles'
    },
    {
      title: 'Add Profile',
      icon: FileDocumentOutline,
      path: '/add-profile'
    },
    {
      sectionTitle: 'Jobs'
    },
    {
      title: 'Jobs',
      icon: Work,
      path: '/jobs'
    },
    {
      title: 'Job Scraping',
      icon: SearchWeb,
      path: '/job-scraping'
    },
    {
      title: 'Auto-Bid Answers',
      icon: QuestionAnswerIcon,
      path: '/auto-bid-answers'
    },
    {
      sectionTitle: 'Settings'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline,
      path: '/account-settings'
    },
    {
      sectionTitle: 'Pages'
    },
    {
      title: 'Login',
      icon: Login,
      path: '/pages/login',
      openInNewTab: true
    },
    {
      title: 'Register',
      icon: AccountPlusOutline,
      path: '/pages/register',
      openInNewTab: true
    }
  ]
}

export default navigation
