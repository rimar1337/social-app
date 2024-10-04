import React from 'react'

import * as persisted from '#/state/persisted'

type StateContext = {
  colorMode: persisted.Schema['colorMode']
  darkTheme: persisted.Schema['darkTheme']
  accentColor: persisted.Schema['accentColor']
}
type SetContext = {
  setColorMode: (v: persisted.Schema['colorMode']) => void
  setDarkTheme: (v: persisted.Schema['darkTheme']) => void
  setAccentColor: (v: persisted.Schema['accentColor']) => void
}

const stateContext = React.createContext<StateContext>({
  colorMode: 'system',
  darkTheme: 'dark',
  accentColor: 0,
})
const setContext = React.createContext<SetContext>({} as SetContext)

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [colorMode, setColorMode] = React.useState(persisted.get('colorMode'))
  const [darkTheme, setDarkTheme] = React.useState(persisted.get('darkTheme'))
  const [accentColor, setAccentColor] = React.useState(
    persisted.get('accentColor'),
  )

  const stateContextValue = React.useMemo(
    () => ({
      colorMode,
      darkTheme,
      accentColor,
    }),
    [colorMode, darkTheme, accentColor],
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
      setAccentColor: (_accentColor: persisted.Schema['accentColor']) => {
        setAccentColor(_accentColor)
        persisted.write('accentColor', _accentColor)
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
    const unsub3 = persisted.onUpdate('accentColor', nextAccentColor => {
      setAccentColor(nextAccentColor)
    })
    return () => {
      unsub1()
      unsub2()
      unsub3()
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
