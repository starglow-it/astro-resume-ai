import * as React from 'react'
import { styled } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import TagFacesIcon from '@mui/icons-material/TagFaces'

interface SkillChipsProps {
  skills: string[]
  setSkills: (skills: string[]) => void
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}))

const SkillChips: React.FC<SkillChipsProps> = ({ skills, setSkills }) => {
  const handleDelete = (index: number) => () => {
    skills.splice(index, 1)
    setSkills(skills)
  }

  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 0
      }}
      component='ul'
    >
      {skills.map((skill, index) => {
        let icon

        if (skill === 'React') {
          icon = <TagFacesIcon />
        }

        return (
          <ListItem key={index}>
            <Chip icon={icon} label={skill} onDelete={skill === 'React' ? undefined : handleDelete(index)} />
          </ListItem>
        )
      })}
    </Paper>
  )
}

export default SkillChips
