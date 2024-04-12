import { useState } from 'react'
import Axios from 'axios'
// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { useAuth } from 'src/@core/context/authContext'

// ** Demo Components Imports
import CardProfile from 'src/views/cards/CardProfile'
import { FetchedProfileData } from 'src/types/ProfileData'
import { API_BASE_URL } from 'src/configs/apiConfig'
import { Button, Box } from '@mui/material'
import { useRouter } from 'next/router'
import { useProfileData } from 'src/@core/context/profileDataContext'
import { withAuth } from 'src/@core/components/withAuth'

// Check Authorization
export const getServerSideProps = withAuth()

const MyProfiles = () => {
  const { token } = useAuth()

  const { profileList, setProfileList } = useProfileData()

  const router = useRouter()

  useEffect(() => {
    const fetchProfileList = async (token: string | null) => {
      try {
        const response = await Axios.get(`${API_BASE_URL}/profile/get-list/`, {
          headers: {
            Authorization: 'Token ' + token
          }
        })

        setProfileList(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    fetchProfileList(token)
  }, [token])

  const editProfile = (id: string) => {
    router.push(`/edit-profile/${id}`)
  }

  const deleteProfile = async (id: string) => {
    try {
      const response = await Axios.delete(`${API_BASE_URL}/profile/delete/${id}/`, {
        headers: {
          Authorization: 'Token ' + token
        }
      })

      setProfileList(profileList.filter(profile => profile.id !== id))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Grid container spacing={6} justifyContent='center'>
      {!profileList.length && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            marginTop: 30
          }}
        >
          <Typography variant='h2'>You have no profiles yet.</Typography>
          <Button variant='outlined' size='large' onClick={() => router.push('/add-profile')} sx={{ marginTop: 30 }}>
            ADD NEW PROFILE
          </Button>
        </Box>
      )}
      {profileList.length > 0 &&
        profileList.map((profile, index) => (
          <Grid item xs={12} key={index}>
            <CardProfile profile={profile} editProfile={editProfile} deleteProfile={deleteProfile} />
          </Grid>
        ))}
    </Grid>
  )
}

export default MyProfiles
