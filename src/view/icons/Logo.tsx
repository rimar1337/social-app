import React from 'react'
import {type TextProps} from 'react-native'
import Svg, {
  //Defs,
  //LinearGradient,
  Path,
  type PathProps,
  //Stop,
  type SvgProps,
} from 'react-native-svg'
import {Image} from 'expo-image'

//import { useKawaiiMode } from '#/state/preferences/kawaii'
import {flatten, useTheme} from '#/alf'

const ratio = 512 / 512

type Props = {
  fill?: PathProps['fill']
  style?: TextProps['style']
} & Omit<SvgProps, 'style'>

export const Logo = React.forwardRef(function LogoImpl(props: Props, ref) {
  const t = useTheme()
  const {fill, ...rest} = props
  const gradient = fill === 'sky'
  const styles = flatten(props.style)
  const _fill = gradient
    ? 'url(#sky)'
    : fill || styles?.color || t.palette.primary_500
  // @ts-ignore it's fiiiiine
  const size = parseInt(rest.width || 32, 10)

  //const isKawaii = useKawaiiMode()

  if (false) {
    return (
      <Image
        source={
          size > 100
            ? require('../../../assets/kawaii.png')
            : require('../../../assets/kawaii_smol.png')
        }
        accessibilityLabel="RedDwarf"
        accessibilityHint=""
        accessibilityIgnoresInvertColors
        style={[{height: size, aspectRatio: 2}]}
      />
    )
  }

  return (
    <Svg
      fill="none"
      // @ts-ignore it's fiiiiine
      ref={ref}
      viewBox="0 0 24 24"
      {...rest}
      style={[{width: size, height: size * ratio}, styles]}>
      <Path
        fill={'#FF4242ff'}
        d="M12.001 0A12 12 0 1 0 24 11.999A12.01 12.01 0 0 0 12.001 0m0 2.464a9.53 9.53 0 0 1 9.514 8.889a9.5 9.5 0 0 1-.863 4.649H3.35a9.53 9.53 0 0 1 .616-9.14a9.53 9.53 0 0 1 8.036-4.398"
      />
    </Svg>
  )
})
