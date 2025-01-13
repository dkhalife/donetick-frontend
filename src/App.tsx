import NavBar from '@/views/components/NavBar'
import { Button, Snackbar, Typography, useColorScheme } from '@mui/joy'
import Tracker from '@openreplay/tracker'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Outlet } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { UserContext } from './contexts/UserContext'
import { AuthenticationProvider } from './service/AuthenticationService'
import { GetUserProfile } from './utils/Fetcher'
import { isTokenValid } from './utils/TokenManager'
import { apiManager } from './utils/TokenManager'

const add = className => {
  document.getElementById('root').classList.add(className)
}

const remove = className => {
  document.getElementById('root').classList.remove(className)
}

const intervalMS = 5 * 60 * 1000 // 5 minutes

function App() {
  startApiManager()
  startOpenReplay()
  const queryClient = new QueryClient()
  const { mode, systemMode } = useColorScheme()
  const [userProfile, setUserProfile] = useState(null)
  const [showUpdateSnackbar, setShowUpdateSnackbar] = useState(true)

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
      r &&
        setInterval(() => {
          r.update()
        }, intervalMS)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const getUserProfile = () => {
    GetUserProfile()
      .then(res => {
        res.json().then(data => {
          setUserProfile(data.res)
        })
      })
      .catch(_ => {})
  }
  useEffect(() => {
    const value = JSON.parse(localStorage.getItem('themeMode')) || mode

    if (value === 'system') {
      if (systemMode === 'dark') {
        return add('dark')
      }
      return remove('dark')
    }

    if (value === 'dark') {
      return add('dark')
    }

    return remove('dark')
  }, [mode, systemMode])
  useEffect(() => {
    if (isTokenValid() && !userProfile) {
      getUserProfile()
    }
  }, [userProfile])

  return (
    <div className='min-h-screen'>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider />
        <UserContext.Provider value={{ userProfile, setUserProfile }}>
          <NavBar />
          <Outlet />
        </UserContext.Provider>
        {needRefresh && (
          <Snackbar open={showUpdateSnackbar}>
            <Typography level='body-md'>
              A new version is now available.Click on reload button to update.
            </Typography>
            <Button
              color='secondary'
              size='small'
              onClick={() => {
                updateServiceWorker(true)
                setShowUpdateSnackbar(false)
              }}
            >
              Refresh
            </Button>
          </Snackbar>
        )}
      </QueryClientProvider>
    </div>
  )
}

const startOpenReplay = () => {
  if (!import.meta.env.VITE_OPENREPLAY_PROJECT_KEY) return
  const tracker = new Tracker({
    projectKey: import.meta.env.VITE_OPENREPLAY_PROJECT_KEY,
  })
  tracker.start()
}
export default App

const startApiManager = () => {
  apiManager.init()
}
