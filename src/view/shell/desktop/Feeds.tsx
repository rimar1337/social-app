import React from 'react'
import {StyleSheet, View} from 'react-native'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation, useNavigationState} from '@react-navigation/native'

import {getCurrentRoute} from '#/lib/routes/helpers'
import {NavigationProp} from '#/lib/routes/types'
import {emitSoftReset} from '#/state/events'
import {usePinnedFeedsInfos} from '#/state/queries/feed'
import {useSelectedFeed, useSetSelectedFeed} from '#/state/shell/selected-feed'
import {TextLink} from '#/view/com/util/Link'
import {useTheme} from '#/alf'

export function DesktopFeeds() {
  const t = useTheme()
  const {_} = useLingui()
  const {data: pinnedFeedInfos} = usePinnedFeedsInfos()
  const selectedFeed = useSelectedFeed()
  const setSelectedFeed = useSetSelectedFeed()
  const navigation = useNavigation<NavigationProp>()
  const route = useNavigationState(state => {
    if (!state) {
      return {name: 'Home'}
    }
    return getCurrentRoute(state)
  })
  if (!pinnedFeedInfos) {
    return null
  }
  return (
    <View style={[styles.container, t.atoms.bg]}>
      {pinnedFeedInfos.map(feedInfo => {
        const feed = feedInfo.feedDescriptor
        return (
          <FeedItem
            key={feed}
            href={'/?' + new URLSearchParams([['feed', feed]])}
            title={feedInfo.displayName}
            current={route.name === 'Home' && feed === selectedFeed}
            onPress={() => {
              setSelectedFeed(feed)
              navigation.navigate('Home')
              if (feed === selectedFeed) {
                emitSoftReset()
              }
            }}
          />
        )
      })}
      <View style={{paddingTop: 8, paddingBottom: 6}}>
        <TextLink
          type="lg"
          href="/feeds"
          text={_(msg`More feeds`)}
          style={{color: t.palette.primary_500}}
        />
      </View>
    </View>
  )
}

function FeedItem({
  title,
  href,
  current,
  onPress,
}: {
  title: string
  href: string
  current: boolean
  onPress: () => void
}) {
  const t = useTheme()
  return (
    <View style={{paddingVertical: 6}}>
      <TextLink
        type="xl"
        href={href}
        text={title}
        onPress={onPress}
        style={[
          current ? t.atoms.text : t.atoms.text_contrast_medium,
          {letterSpacing: 0.15, fontWeight: current ? '600' : '400'},
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // @ts-ignore web only -prf
    overflowY: 'auto',
    width: 300,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
})
