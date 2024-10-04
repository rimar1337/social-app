import {useMemo} from 'react'
import {TextStyle, ViewStyle} from 'react-native'

import {useThemePrefs} from '#/state/shell/index'
import {createThemes} from '#/alf/themes'
import {BLUE_HUE, GREEN_HUE, RED_HUE} from '#/alf/util/colorGeneration'
import {PaletteColor, PaletteColorName} from '../ThemeContext'

export interface UsePaletteValue {
  colors: PaletteColor
  view: ViewStyle
  viewLight: ViewStyle
  btn: ViewStyle
  border: ViewStyle
  borderDark: ViewStyle
  text: TextStyle
  textLight: TextStyle
  textInverted: TextStyle
  link: TextStyle
  icon: TextStyle
}
export function usePalette(color: PaletteColorName): UsePaletteValue {
  //const theme = ThemeProvider()
  const {accentColor, colorMode, darkTheme} = useThemePrefs()
  return useMemo(() => {
    const {light, dark, dim} = createThemes({
      hues: {
        primary: BLUE_HUE,
        negative: RED_HUE,
        positive: GREEN_HUE,
      },
      hueShift: accentColor,
    })
    const paletteNameTemp =
      colorMode === 'light' ? light : darkTheme === 'dark' ? dark : dim
    const paletteName =
      color === 'inverted'
        ? paletteNameTemp === light
          ? dark
          : light
        : paletteNameTemp
    return {
      colors: {
        background: paletteName.atoms.bg.backgroundColor,
        backgroundLight: paletteName.atoms.bg_contrast_25.backgroundColor,
        text: paletteName.atoms.text.color,
        textLight: paletteName.atoms.text_contrast_medium.color,
        textInverted: paletteName.atoms.text_inverted.color,
        link: paletteName.palette.primary_500,
        border: paletteName.atoms.bg_contrast_100.backgroundColor,
        borderDark: paletteName.atoms.bg_contrast_200.backgroundColor,
        icon: paletteName.palette.contrast_500,

        // non-standard
        textVeryLight: paletteName.atoms.bg_contrast_400.backgroundColor,
        replyLine: paletteName.atoms.bg_contrast_100.backgroundColor,
        replyLineDot: paletteName.atoms.bg_contrast_200.backgroundColor,
        unreadNotifBg: paletteName.palette.primary_25,
        unreadNotifBorder: paletteName.palette.primary_100,
        postCtrl: paletteName.atoms.bg_contrast_500.backgroundColor,
        brandText: paletteName.palette.primary_500,
        emptyStateIcon: paletteName.atoms.bg_contrast_300.backgroundColor,
        borderLinkHover: paletteName.atoms.bg_contrast_300.backgroundColor,
        // get more from src/lib/themes.ts later ok thx
      },
      view: {
        backgroundColor: paletteName.atoms.bg.backgroundColor,
      },
      viewLight: {
        backgroundColor: paletteName.atoms.bg_contrast_25.backgroundColor,
      },
      btn: {
        backgroundColor: paletteName.atoms.bg_contrast_25.backgroundColor,
      },
      border: {
        borderColor: paletteName.atoms.bg_contrast_100.backgroundColor,
      },
      borderDark: {
        borderColor: paletteName.atoms.bg_contrast_200.backgroundColor,
      },
      text: {
        color: paletteName.atoms.text.color,
      },
      textLight: {
        color: paletteName.atoms.text_contrast_medium.color,
      },
      textInverted: {
        color: paletteName.atoms.text_inverted.color,
      },
      link: {
        color: paletteName.palette.primary_500,
      },
      icon: {
        color: paletteName.palette.contrast_500,
      },
    }
  }, [accentColor, color, colorMode, darkTheme])
}
