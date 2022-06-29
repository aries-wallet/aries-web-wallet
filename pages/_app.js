import { ThemeProvider } from '@emotion/react'
import { Stack } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import '../styles/globals.css'
import SideBar from './_sideBar'

const theme = createTheme({
  palette: {
    mode: 'dark',
  }
})

function MyApp({ Component, pageProps }) {
  return <ThemeProvider theme={theme}>
    <Stack spacing={2} direction='row'>
      <SideBar />
      <div style={{width:'100%', height: "100vh", overflow: "scroll"}}>
        <Component {...pageProps} />
      </div>
    </Stack>
  </ThemeProvider>
}

export default MyApp
