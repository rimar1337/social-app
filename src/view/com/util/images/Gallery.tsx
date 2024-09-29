import React from 'react'
import {Pressable, StyleProp, View, ViewStyle} from 'react-native'
import {Image, ImageStyle} from 'expo-image'
import {AppBskyEmbedImages} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useLargeAltBadgeEnabled} from '#/state/preferences/large-alt-badge'
import {PostEmbedViewContext} from '#/view/com/util/post-embeds/types'
import {atoms as a, useTheme} from '#/alf'
import {ArrowsDiagonalOut_Stroke2_Corner0_Rounded as Fullscreen} from '#/components/icons/ArrowsDiagonal'
import {MediaInsetBorder} from '#/components/MediaInsetBorder'
import {Text} from '#/components/Typography'

type EventFunction = (index: number) => void

interface Props {
  images: AppBskyEmbedImages.ViewImage[]
  index: number
  onPress?: EventFunction
  onLongPress?: EventFunction
  onPressIn?: EventFunction
  imageStyle?: StyleProp<ImageStyle>
  viewContext?: PostEmbedViewContext
  insetBorderStyle?: StyleProp<ViewStyle>
  isCropped?: boolean
}

export function GalleryItem({
  images,
  index,
  imageStyle,
  onPress,
  onPressIn,
  onLongPress,
  viewContext,
  insetBorderStyle,
  isCropped,
}: Props) {
  const t = useTheme()
  const {_} = useLingui()
  const largeAltBadge = useLargeAltBadgeEnabled()
  const image = images[index]
  const hasAlt = !!image.alt
  const hideBadges =
    viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia
  return (
    <View style={a.flex_1}>
      <Pressable
        onPress={onPress ? () => onPress(index) : undefined}
        onPressIn={onPressIn ? () => onPressIn(index) : undefined}
        onLongPress={onLongPress ? () => onLongPress(index) : undefined}
        style={[
          a.flex_1,
          a.overflow_hidden,
          t.atoms.bg_contrast_25,
          imageStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={image.alt || _(msg`Image`)}
        accessibilityHint="">
        <Image
          source={{uri: image.thumb}}
          style={[a.flex_1]}
          accessible={true}
          accessibilityLabel={image.alt}
          accessibilityHint=""
          accessibilityIgnoresInvertColors
        />
        <MediaInsetBorder style={insetBorderStyle} />
      </Pressable>
      {(hasAlt || isCropped) && !hideBadges ? (
        <View
          accessible={false}
          style={[
            a.absolute,
            a.flex_row,
            a.align_center,
            a.rounded_xs,
            t.atoms.bg_contrast_25,
            {
              gap: 3,
              padding: 3,
              bottom: a.p_xs.padding,
              right: a.p_xs.padding,
              opacity: 0.8,
            },
            largeAltBadge && [
              {
                gap: 4,
                padding: 5,
              },
            ],
          ]}>
          {hasAlt && (
            <Text
              style={[a.font_heavy, largeAltBadge ? a.text_xs : {fontSize: 8}]}>
              ALT
            </Text>
          )}
          {isCropped && (
            <Fullscreen
              fill={t.atoms.text_contrast_high.color}
              width={largeAltBadge ? 18 : 12}
            />
          )}
        </View>
      ) : null}
    </View>
  )
}
