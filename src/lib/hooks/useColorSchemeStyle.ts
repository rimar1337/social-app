import {useTheme} from '#/alf'

export function useColorSchemeStyle<T>(lightStyle: T, darkStyle: T) {
  const colorScheme = useTheme().name
  return colorScheme === 'dark' ? darkStyle : lightStyle
}
