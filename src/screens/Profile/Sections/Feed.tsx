import React from 'react'
import {findNodeHandle, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useQueryClient} from '@tanstack/react-query'

import {useInitialNumToRender} from '#/lib/hooks/useInitialNumToRender'
import {isNative} from '#/platform/detection'
import {FeedDescriptor} from '#/state/queries/post-feed'
import {RQKEY as FEED_RQKEY} from '#/state/queries/post-feed'
import {truncateAndInvalidate} from '#/state/queries/util'
import {Feed} from '#/view/com/posts/Feed'
import {EmptyState} from '#/view/com/util/EmptyState'
import {ListRef} from '#/view/com/util/List'
import {LoadLatestBtn} from '#/view/com/util/load-latest/LoadLatestBtn'
import {Text} from '#/view/com/util/text/Text'
import {useTheme} from '#/alf'
import {ios} from '#/alf'
import {SectionRef} from './types'

interface FeedSectionProps {
  feed: FeedDescriptor
  headerHeight: number
  isFocused: boolean
  scrollElRef: ListRef
  ignoreFilterFor?: string
  setScrollViewTag: (tag: number | null) => void
}
export const ProfileFeedSection = React.forwardRef<
  SectionRef,
  FeedSectionProps
>(function FeedSectionImpl(
  {
    feed,
    headerHeight,
    isFocused,
    scrollElRef,
    ignoreFilterFor,
    setScrollViewTag,
  },
  ref,
) {
  const {_} = useLingui()
  const queryClient = useQueryClient()
  const [hasNew, setHasNew] = React.useState(false)
  const [isScrolledDown, setIsScrolledDown] = React.useState(false)
  const shouldUseAdjustedNumToRender = feed.endsWith('posts_and_author_threads')
  const adjustedInitialNumToRender = useInitialNumToRender({
    screenHeightOffset: headerHeight,
  })

  const onScrollToTop = React.useCallback(() => {
    scrollElRef.current?.scrollToOffset({
      animated: isNative,
      offset: -headerHeight,
    })
    truncateAndInvalidate(queryClient, FEED_RQKEY(feed))
    setHasNew(false)
  }, [scrollElRef, headerHeight, queryClient, feed, setHasNew])
  React.useImperativeHandle(ref, () => ({
    scrollToTop: onScrollToTop,
  }))

  const renderPostsEmpty = React.useCallback(() => {
    return <EmptyState icon="growth" message={_(msg`No posts yet.`)} />
  }, [_])

  React.useEffect(() => {
    if (isFocused && scrollElRef.current) {
      const nativeTag = findNodeHandle(scrollElRef.current)
      setScrollViewTag(nativeTag)
    }
  }, [isFocused, scrollElRef, setScrollViewTag])

  return (
    <View>
      <Feed
        testID="postsFeed"
        enabled={isFocused}
        feed={feed}
        scrollElRef={scrollElRef}
        onHasNew={setHasNew}
        onScrolledDownChange={setIsScrolledDown}
        renderEmptyState={renderPostsEmpty}
        headerOffset={headerHeight}
        progressViewOffset={ios(0)}
        renderEndOfFeed={ProfileEndOfFeed}
        ignoreFilterFor={ignoreFilterFor}
        initialNumToRender={
          shouldUseAdjustedNumToRender ? adjustedInitialNumToRender : undefined
        }
      />
      {(isScrolledDown || hasNew) && (
        <LoadLatestBtn
          onPress={onScrollToTop}
          label={_(msg`Load new posts`)}
          showIndicator={hasNew}
        />
      )}
    </View>
  )
})

function ProfileEndOfFeed() {
  const t = useTheme()

  return (
    <View
      style={[
        t.atoms.border_contrast_low,
        {paddingTop: 32, paddingBottom: 32, borderTopWidth: 1},
      ]}>
      <Text
        style={[
          t.atoms.text_contrast_high,
          t.atoms.border_contrast_low,
          {textAlign: 'center'},
        ]}>
        <Trans>End of feed</Trans>
      </Text>
    </View>
  )
}
