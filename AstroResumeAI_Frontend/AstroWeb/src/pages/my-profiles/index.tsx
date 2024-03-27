import {useState} from 'react'
import Axios from 'axios'
// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { useAuth } from 'src/@core/context/authContext'

// ** Demo Components Imports
import CardProfile from 'src/views/cards/CardProfile'
import { FetchedProfileData } from 'src/types/ProfileData'

const MyProfiles = () => {
  const { token } = useAuth();

  const [profileList, setProfileList] = useState<FetchedProfileData[]>([])

  useEffect(() => {
    const fetchProfileList = async (token: string|null) => {
      try {
        const response = await Axios.get('http://localhost:8000/profile/get-list/', {
          headers: {
            Authorization: 'Token ' + token
          }
        })

        setProfileList(response.data);
      } catch (error) {
        console.log(error)
      }
    };

    fetchProfileList(token);

  }, [])

  const editProfile = (profileId: string) => {
    try {
      
    } catch (error) {

    }
  }

  const deleteProfile = (profileId: string) => {
    try {
      
    } catch (error) {

    }
  }

  return (
    <Grid container spacing={6}>
      {profileList.map((profile) => (
        <Grid item xs={12}>
          <CardProfile profile={profile} editProfile={editProfile} deleteProfile={deleteProfile} />
        </Grid>
      ))}
    </Grid>
  )
}

export default MyProfiles
