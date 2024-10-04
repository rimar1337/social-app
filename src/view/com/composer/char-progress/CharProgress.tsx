import React from 'react'
import {View} from 'react-native'
// @ts-ignore no type definition -prf
import ProgressCircle from 'react-native-progress/Circle'
// @ts-ignore no type definition -prf
import ProgressPie from 'react-native-progress/Pie'

import {MAX_GRAPHEME_LENGTH} from '#/lib/constants'
import {s} from '#/lib/styles'
import {useTheme} from '#/alf'
import {Text} from '../../util/text/Text'

const DANGER_LENGTH = MAX_GRAPHEME_LENGTH

export function CharProgress({count}: {count: number}) {
  const t = useTheme()
  const textColor = count > DANGER_LENGTH ? '#e60000' : t.atoms.text.color
  const circleColor = count > DANGER_LENGTH ? '#e60000' : t.palette.primary_500
  return (
    <>
      <Text style={[s.mr10, s.tabularNum, {color: textColor}]}>
        {MAX_GRAPHEME_LENGTH - count}
      </Text>
      <View>
        {count > DANGER_LENGTH ? (
          <ProgressPie
            size={30}
            borderWidth={4}
            borderColor={circleColor}
            color={circleColor}
            progress={Math.min(
              (count - MAX_GRAPHEME_LENGTH) / MAX_GRAPHEME_LENGTH,
              1,
            )}
          />
        ) : (
          <ProgressCircle
            size={30}
            borderWidth={1}
            borderColor={t.atoms.bg_contrast_100.backgroundColor}
            color={circleColor}
            progress={count / MAX_GRAPHEME_LENGTH}
          />
        )}
      </View>
    </>
  )
}
