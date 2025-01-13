import { Box, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

const Container = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  padding: '24px',
  display: 'grid',
  placeItems: 'start center',
  [theme.breakpoints.up('sm')]: {
    // center children
    placeItems: 'center',
  },
}))

const AuthCard = styled(Paper)(({ theme }) => ({
  //   border: "1px solid #c4c4c4",
  padding: 24,
  paddingTop: 32,
  borderRadius: 24,
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: 'unset',
  },
}))

export default function AuthCardContainer({ children }) {
  return (
    <Container>
      <AuthCard elevation={0}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            paddingBottom: 4,
          }}
        >
          {/* <Logo size='96px' /> */}
        </Box>
        {children}
      </AuthCard>
    </Container>
  )
}
