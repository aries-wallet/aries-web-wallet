import { ThemeProvider } from '@emotion/react'
import { Stack } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import '../styles/globals.css'
import { initDb } from './utils/db'
import SideBar from './_sideBar'

const theme = createTheme({
  palette: {
    mode: 'light',
  }
})

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    initDb().then(ret=>{
      console.log('initDb', ret)
      setLoading(false);
    }).catch(console.error).finally(()=>console.log('initDb finish'));
  }, []);

  return <ThemeProvider theme={theme}>
    {
      loading ? <div>loading...</div> :  <Stack spacing={2} direction='row' >
        <SideBar />
        <div style={{width:'100%', height: "100vh", overflow: "scroll"}}>
          <Component {...pageProps} />
        </div>
      </Stack>
    }
   
  </ThemeProvider>
}

export default MyApp
