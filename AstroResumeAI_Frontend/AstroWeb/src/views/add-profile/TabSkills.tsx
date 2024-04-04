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
import SkillChips from './SkillChips'

import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import DirectionsIcon from '@mui/icons-material/Directions'
import { PlusBox, PlusBoxOutline, PlusCircle } from 'mdi-material-ui'

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

interface TabWorkExperienceProps {
  handleSetTab: (tab: string) => void
}

const TabWorkExperience: React.FC<TabWorkExperienceProps> = ({ handleSetTab }) => {
  // ** State
  const [openAlert, setOpenAlert] = useState<boolean>(true)

  const { profileData, setProfileData } = useProfileData()

  const [tempSkills, setTempSkills] = useState<string[]>([])

  const handleSetCategoryName = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const updatedSkills = [...profileData.skills]

    updatedSkills[index] = {
      ...updatedSkills[index],
      category_name: event.target.value
    }

    setProfileData({
      ...profileData,
      skills: updatedSkills
    })
  }

  const handleSetSkills = (index: number) => (skills: string[]) => {
    const updatedSkills = [...profileData.skills]

    updatedSkills[index] = {
      ...updatedSkills[index],
      skills
    }

    setProfileData({
      ...profileData,
      skills: updatedSkills
    })
  }

  const handleChangeTempSkill = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    setTempSkills({ ...tempSkills, [index]: event.target.value })
  }

  const addSkill = (index: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    const updatedSkills = [...profileData.skills]

    updatedSkills[index].skills.push(tempSkills[index])

    setProfileData({
      ...profileData,
      skills: updatedSkills
    })

    setTempSkills({ ...tempSkills, [index]: '' })
  }

  const addCategory = () => {
    const updatedSkills = [...profileData.skills]

    updatedSkills.push({
      category_name: '',
      skills: []
    })

    setProfileData({
      ...profileData,
      skills: updatedSkills
    })

    setTempSkills([...tempSkills, ''])
  }

  const deleteCategory = (index: number) => {
    const updatedSkills = [...profileData.skills]
    const updatedTempSkills = [...tempSkills]

    updatedSkills.splice(index, 1)
    updatedTempSkills.splice(index, 1)

    setProfileData({
      ...profileData,
      skills: updatedSkills
    })

    setTempSkills(updatedTempSkills)
  }

  const handleReset = () => {
    setProfileData({
      ...profileData,
      skills: []
    })

    setTempSkills([])
  }

  return (
    <CardContent sx={{ marginTop: 4.75 }}>
      <form>
        {profileData.skills.map((skill, index) => (
          <Grid container spacing={7} sx={{ marginBottom: 10 }} key={index}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Category Name'
                placeholder='Programming Language'
                value={skill.category_name}
                onChange={handleSetCategoryName(index)}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper component='form' sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
                <InputBase
                  sx={{ ml: 10, flex: 1 }}
                  placeholder='Add new skill'
                  inputProps={{ 'aria-label': 'add new skill' }}
                  value={tempSkills[index]}
                  onChange={handleChangeTempSkill(index)}
                />
                {/* <IconButton type='button' sx={{ p: '10px' }} aria-label='search'>
                  <SearchIcon />
                </IconButton> */}
                <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
                <IconButton color='primary' sx={{ p: '10px' }} aria-label='directions' onClick={addSkill(index)}>
                  <PlusCircle />
                </IconButton>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <SkillChips skills={skill.skills} setSkills={handleSetSkills(index)} />
            </Grid>

            <Grid item xs={12} container justifyContent='flex-end'>
              <Button variant='outlined' size='small' onClick={() => deleteCategory(index)}>
                Delete
              </Button>
            </Grid>
          </Grid>
        ))}

        <Grid item xs={12} sx={{ marginBottom: 5 }}>
          <Button variant='outlined' onClick={addCategory}>
            Add New Skills Category
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => handleSetTab('work_experience')}>
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

export default TabWorkExperience
