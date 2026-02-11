import React from 'react'

import * as persisted from '#/state/persisted'

type StateContext = {
  colorMode: persisted.Schema['colorMode']
  darkTheme: persisted.Schema['darkTheme']
  colorScheme: persisted.Schema['colorScheme']
  hue: persisted.Schema['hue']
}
type SetContext = {
  setColorMode: (v: persisted.Schema['colorMode']) => void
  setDarkTheme: (v: persisted.Schema['darkTheme']) => void
  setColorScheme: (v: persisted.Schema['colorScheme']) => void
  setHue: (v: persisted.Schema['hue']) => void
}

const stateContext = React.createContext<StateContext>({
  colorMode: 'system',
  darkTheme: 'dark',
  colorScheme: 'reddwarf',
  hue: 0,
})
stateContext.displayName = 'ColorModeStateContext'
const setContext = React.createContext<SetContext>({} as SetContext)
setContext.displayName = 'ColorModeSetContext'

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [colorMode, setColorMode] = React.useState(persisted.get('colorMode'))
  const [darkTheme, setDarkTheme] = React.useState(persisted.get('darkTheme'))
  const [colorScheme, setColorScheme] = React.useState(
    persisted.get('colorScheme'),
  )
  const [hue, setHue] = React.useState(persisted.get('hue'))

  const stateContextValue = React.useMemo(
    () => ({
      colorMode,
      darkTheme,
      colorScheme,
      hue,
    }),
    [colorMode, darkTheme, colorScheme, hue],
  )

  const setContextValue = React.useMemo(
    () => ({
      setColorMode: (_colorMode: persisted.Schema['colorMode']) => {
        setColorMode(_colorMode)
        persisted.write('colorMode', _colorMode)
      },
      setDarkTheme: (_darkTheme: persisted.Schema['darkTheme']) => {
        setDarkTheme(_darkTheme)
        persisted.write('darkTheme', _darkTheme)
      },
      setColorScheme: (_colorScheme: persisted.Schema['colorScheme']) => {
        setColorScheme(_colorScheme)
        persisted.write('colorScheme', _colorScheme)
      },
      setHue: (_hue: persisted.Schema['hue']) => {
        setHue(_hue)
        persisted.write('hue', _hue)
      },
    }),
    [],
  )

  React.useEffect(() => {
    const unsub1 = persisted.onUpdate('darkTheme', nextDarkTheme => {
      setDarkTheme(nextDarkTheme)
    })
    const unsub2 = persisted.onUpdate('colorMode', nextColorMode => {
      setColorMode(nextColorMode)
    })
    const unsub3 = persisted.onUpdate('colorScheme', nextColorScheme => {
      setColorScheme(nextColorScheme)
    })
    const unsub4 = persisted.onUpdate('hue', nextHue => {
      setHue(nextHue)
    })
    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
    }
  }, [])

  return (
    <stateContext.Provider value={stateContextValue}>
      <setContext.Provider value={setContextValue}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export function useThemePrefs() {
  return React.useContext(stateContext)
}

export function useSetThemePrefs() {
  return React.useContext(setContext)
}
