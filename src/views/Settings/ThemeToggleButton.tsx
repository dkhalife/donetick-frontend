import { useStickyState } from '../../hooks/useStickyState'
import {
  BrightnessAuto,
  DarkModeOutlined,
  LightModeOutlined,
} from '@mui/icons-material'
import { FormControl, IconButton, useColorScheme } from '@mui/joy'
import { SxProps } from '@mui/joy/styles/types'
import React from 'react'

interface ThemeToggleButtonProps {
  sx: SxProps
}

export class ThemeToggleButton extends React.Component<ThemeToggleButtonProps> {
  render(): React.ReactNode {
    const { mode, setMode } = useColorScheme()
    const [themeMode, setThemeMode] = useStickyState(mode ?? 'system', 'themeMode')

    const handleThemeModeChange = e => {
      e.preventDefault()
      e.stopPropagation()

      let newThemeMode
      switch (themeMode) {
        case 'light':
          newThemeMode = 'dark'
          break
        case 'dark':
          newThemeMode = 'system'
          break
        case 'system':
        default:
          newThemeMode = 'light'
          break
      }

      setThemeMode(newThemeMode)
      setMode(newThemeMode)
    }

    return (
      <FormControl sx={this.props.sx}>
        <IconButton onClick={handleThemeModeChange}>
          {themeMode === 'light' ? (
            <DarkModeOutlined />
          ) : themeMode === 'dark' ? (
            <BrightnessAuto />
          ) : (
            <LightModeOutlined />
          )}
        </IconButton>
      </FormControl>
    )
  }
}
