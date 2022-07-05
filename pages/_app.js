import { ThemeProvider } from '@emotion/react'
import { Stack } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import '../styles/globals.css'
import { initDb } from '../utils/db'
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
    }).catch(console.error).finally(()=>{
      console.log('initDb finish');
      setLoading(false);
    });
  }, []);

  return <ThemeProvider theme={theme}>
    {
      loading ? <div style={{width:'100%', textAlign:'center'}}>
          <Image alt="Loading..." src="/loading.gif" width="800" height="600" />
        </div> :  <Stack spacing={2} direction='row' >
        <SideBar />
        <div style={{width:'100%', height: "100vh", overflow: "scroll"}}>
          <Component {...pageProps} />
        </div>
      </Stack>
    }
   
  </ThemeProvider>
}

export default MyApp
