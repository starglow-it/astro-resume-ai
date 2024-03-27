// ** React Imports
import { ChangeEvent, MouseEvent, ReactNode, useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

const ConfirmErrorPage = () => {

  return (
    <Box className='content-center'>
      <Typography variant='h4'>Confirmation was not successful. Please check the link again.</Typography>
      <FooterIllustrationsV1 />
    </Box>
  )
}

ConfirmErrorPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ConfirmErrorPage
