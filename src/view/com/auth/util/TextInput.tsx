import React, {ComponentProps} from 'react'
import {StyleSheet, TextInput as RNTextInput, View} from 'react-native'
import {IconProp} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'

import {atoms as a,useTheme} from '#/alf'

interface Props extends Omit<ComponentProps<typeof RNTextInput>, 'onChange'> {
  testID?: string
  icon: IconProp
  onChange: (v: string) => void
}

export function TextInput({testID, icon, onChange, ...props}: Props) {
  const t = useTheme()
  return (
    <View style={[a.border, styles.container]}>
      <FontAwesomeIcon
        icon={icon}
        color={t.atoms.text_contrast_medium.color}
        style={[styles.icon]}
      />
      <RNTextInput
        testID={testID}
        style={[t.atoms.text, styles.textInput]}
        placeholderTextColor={t.atoms.text_contrast_medium.color}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance={t.name === 'dark' ? 'dark' : 'light'}
        onChangeText={v => onChange(v)}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  icon: {
    marginLeft: 10,
  },
  textInput: {
    flex: 1,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 17,
    letterSpacing: 0.25,
    fontWeight: '400',
    borderRadius: 10,
  },
})
