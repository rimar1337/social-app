import React from 'react'

import {choose} from '#/lib/functions'
import {useTheme} from '#/alf'

export function useCustomPalette<T>({light, dark}: {light: T; dark: T}) {
  const t = useTheme()
  const themeName = t.name === 'dark' ? 'dark' : 'light'
  return React.useMemo(() => {
    return choose<T, Record<string, T>>(themeName, {
      dark,
      light,
    })
  }, [themeName, dark, light])
}
