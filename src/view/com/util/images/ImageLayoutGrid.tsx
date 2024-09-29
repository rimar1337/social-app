import React from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'
import {AppBskyEmbedImages} from '@atproto/api'

import {PostEmbedViewContext} from '#/view/com/util/post-embeds/types'
import {atoms as a, useBreakpoints} from '#/alf'
import {GalleryItem} from './Gallery'

interface ImageLayoutGridProps {
  images: AppBskyEmbedImages.ViewImage[]
  onPress?: (index: number) => void
  onLongPress?: (index: number) => void
  onPressIn?: (index: number) => void
  style?: StyleProp<ViewStyle>
  viewContext?: PostEmbedViewContext
}

export function ImageLayoutGrid({style, ...props}: ImageLayoutGridProps) {
  const {gtMobile} = useBreakpoints()
  const gap =
    props.viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia
      ? gtMobile
        ? a.gap_xs
        : a.gap_2xs
      : a.gap_xs

  return (
    <View style={style}>
      <View style={[gap, a.rounded_md, a.overflow_hidden]}>
        <ImageLayoutGridInner {...props} gap={gap} />
      </View>
    </View>
  )
}

interface ImageLayoutGridInnerProps {
  images: AppBskyEmbedImages.ViewImage[]
  onPress?: (index: number) => void
  onLongPress?: (index: number) => void
  onPressIn?: (index: number) => void
  viewContext?: PostEmbedViewContext
  gap: {gap: number}
}

function ImageFlex({
  forwardprop,
  firstImg,
  secondImg,
  thirdImg,
  fourthImg,
  targetratio,
}: {
  forwardprop: ImageLayoutGridInnerProps
  firstImg: AppBskyEmbedImages.ViewImage
  secondImg: AppBskyEmbedImages.ViewImage
  thirdImg?: AppBskyEmbedImages.ViewImage
  fourthImg?: AppBskyEmbedImages.ViewImage
  targetratio: number
}) {
  const cheight = (image: AppBskyEmbedImages.ViewImage) =>
    image?.aspectRatio?.height || 1
  const cwidth = (image: AppBskyEmbedImages.ViewImage) =>
    image?.aspectRatio?.width || 1
  const calculateAspectRatio = (image: AppBskyEmbedImages.ViewImage) =>
    cwidth(image) / cheight(image)

  function calculateLayout({
    img1,
    img2,
    tryVertical = false,
    unclampedMaxVertical = false,
    desiredAspect,
    minPercentMainAxis,
    maxPercentMainAxis,
    minPercentCrossAxis,
    maxPercentCrossAxis,
  }: {
    img1: number
    img2: number
    tryVertical?: boolean
    unclampedMaxVertical?: boolean
    desiredAspect: number
    minPercentMainAxis: number
    maxPercentMainAxis: number
    minPercentCrossAxis: number
    maxPercentCrossAxis: number
  }) {
    // Calculate initial aspect ratios for the first and last images
    const initialMainAxisFirst = tryVertical ? 1 / img1 : img1
    const initialMainAxisLast = tryVertical ? 1 / img2 : img2

    const tempMainAxisFirst =
      ((tryVertical ? initialMainAxisFirst : 1) * initialMainAxisFirst) /
      (initialMainAxisFirst + initialMainAxisLast)
    const tempMainAxisLast =
      ((tryVertical ? initialMainAxisLast : 1) * initialMainAxisLast) /
      (initialMainAxisFirst + initialMainAxisLast)

    // Main axis clamping
    const tempDesiredMainAxisFirst = Math.min(
      Math.max(tempMainAxisFirst, minPercentMainAxis),
      maxPercentMainAxis,
    )
    const tempDesiredMainAxisLast = Math.min(
      Math.max(tempMainAxisLast, minPercentMainAxis),
      maxPercentMainAxis,
    )

    const sumFirstLast = tempDesiredMainAxisFirst + tempDesiredMainAxisLast
    const tooLargeAgain = sumFirstLast > 1
    const firstIsSmaller = tempDesiredMainAxisFirst < tempDesiredMainAxisLast

    const almostDesiredMainAxisFirst = tooLargeAgain
      ? firstIsSmaller
        ? tempDesiredMainAxisFirst
        : 1 - tempDesiredMainAxisLast
      : tempDesiredMainAxisFirst
    const almostDesiredMainAxisLast = tooLargeAgain
      ? firstIsSmaller
        ? 1 - tempDesiredMainAxisFirst
        : tempDesiredMainAxisLast
      : tempDesiredMainAxisLast

    const desiredMainAxisFirst = tryVertical
      ? tempDesiredMainAxisFirst
      : almostDesiredMainAxisFirst
    const desiredMainAxisLast = tryVertical
      ? tempDesiredMainAxisLast
      : almostDesiredMainAxisLast

    // Cross axis clamping
    const tempCrossAxis =
      (desiredMainAxisFirst * (1 / initialMainAxisFirst) +
        desiredMainAxisLast * (1 / initialMainAxisLast)) /
      2
    const desiredCrossAxis = Math.min(
      Math.max(tempCrossAxis, (1 / desiredAspect) * minPercentCrossAxis),
      (1 / desiredAspect) * maxPercentCrossAxis,
    )

    // Vertical only adjustments
    const firstHalfFirst = Math.max(
      desiredMainAxisFirst / desiredCrossAxis,
      minPercentMainAxis,
    )
    const firstHalfLast = Math.max(
      desiredMainAxisLast / desiredCrossAxis,
      minPercentMainAxis,
    )
    const annoyingAspectFirst = Math.min(firstHalfFirst, maxPercentMainAxis)
    const annoyingAspectLast = Math.min(firstHalfLast, maxPercentMainAxis)

    const tooTallAgain =
      1 / annoyingAspectFirst + 1 / annoyingAspectLast > 1 / desiredAspect
    const firstIsShorter = annoyingAspectFirst < annoyingAspectLast

    const tempAnnoyingAspectFirst = tooTallAgain
      ? firstIsShorter
        ? annoyingAspectFirst
        : 1 / desiredAspect - annoyingAspectLast
      : annoyingAspectFirst
    const tempAnnoyingAspectLast = tooTallAgain
      ? firstIsShorter
        ? 1 / desiredAspect - annoyingAspectFirst
        : annoyingAspectLast
      : annoyingAspectLast

    const aspectFirst = tryVertical
      ? unclampedMaxVertical
        ? firstHalfFirst
        : 1 / tempAnnoyingAspectFirst
      : desiredMainAxisFirst / desiredCrossAxis
    const aspectLast = tryVertical
      ? unclampedMaxVertical
        ? firstHalfLast
        : 1 / tempAnnoyingAspectLast
      : desiredMainAxisLast / desiredCrossAxis

    // Crop detection (todo: broken after nesting)
    const imgCrop1 =
      tempMainAxisFirst < minPercentMainAxis ||
      tempMainAxisFirst > maxPercentMainAxis ||
      tempCrossAxis < minPercentCrossAxis ||
      tempCrossAxis > maxPercentCrossAxis ||
      (tooLargeAgain && firstIsSmaller)
    const imgCrop2 =
      tempMainAxisLast < minPercentMainAxis ||
      tempMainAxisLast > maxPercentMainAxis ||
      tempCrossAxis < minPercentCrossAxis ||
      tempCrossAxis > maxPercentCrossAxis ||
      (tooLargeAgain && !firstIsSmaller)

    return {
      desiredMainAxisFirst,
      desiredMainAxisLast,
      aspectFirst,
      aspectLast,
      imgCrop1,
      imgCrop2,
    }
  }

  let flexfirst: number
  let flexsecond: number
  let flexthird: number
  let flexfourth: number

  let flexoutterfirst: number
  let flexoutterlast: number

  let aspectfirst: number
  let aspectsecond: number
  let aspectthird: number
  let aspectfourth: number

  let cropfirst: boolean
  let cropsecond: boolean
  let cropthird: boolean
  let cropfourth: boolean

  if (fourthImg && thirdImg) {
    const {
      desiredMainAxisFirst: flexinnerfirst1,
      desiredMainAxisLast: flexinnerlast1,
      aspectFirst: aspectInnerFirst1,
      aspectLast: aspectInnerLast1,
      imgCrop1: cropinnerfirst1,
      imgCrop2: cropinnerlast1,
    } = calculateLayout({
      img1: calculateAspectRatio(firstImg),
      img2: calculateAspectRatio(secondImg),
      tryVertical: false,
      unclampedMaxVertical: false,
      desiredAspect: targetratio * 2,
      minPercentMainAxis: 0.25,
      maxPercentMainAxis: 1 - 0.25,
      minPercentCrossAxis: 0.5, //0.25,
      maxPercentCrossAxis: 1,
    })
    const {
      desiredMainAxisFirst: flexinnerfirst2,
      desiredMainAxisLast: flexinnerlast2,
      aspectFirst: aspectInnerFirst2,
      aspectLast: aspectInnerLast2,
      imgCrop1: cropinnerfirst2,
      imgCrop2: cropinnerlast2,
    } = calculateLayout({
      img1: calculateAspectRatio(thirdImg),
      img2: calculateAspectRatio(fourthImg),
      tryVertical: false,
      unclampedMaxVertical: false,
      desiredAspect: targetratio * 2,
      minPercentMainAxis: 0.25,
      maxPercentMainAxis: 1 - 0.25,
      minPercentCrossAxis: 0.5, //0.25,
      maxPercentCrossAxis: 1,
    })
    const {
      desiredMainAxisFirst: flexoutterfirste,
      desiredMainAxisLast: flexoutterlaste,
      //aspectFirst: aspectInnerFirst2,
      //aspectLast: aspectInnerLast2,
      //imgCrop1: cropinnerfirst2,
      //imgCrop2: cropinnerlast2,
    } = calculateLayout({
      img1: flexinnerfirst1 + flexinnerlast1,
      img2: flexinnerfirst2 + flexinnerlast2,
      tryVertical: true,
      unclampedMaxVertical: false,
      desiredAspect: targetratio,
      minPercentMainAxis: 0.25,
      maxPercentMainAxis: 1 - 0.25,
      minPercentCrossAxis: 0.25,
      maxPercentCrossAxis: 1,
    })

    flexfirst = flexinnerfirst1
    flexsecond = flexinnerlast1
    flexthird = flexinnerfirst2
    flexfourth = flexinnerlast2

    flexoutterfirst = flexoutterfirste
    flexoutterlast = flexoutterlaste

    aspectfirst = aspectInnerFirst1
    aspectsecond = aspectInnerLast1
    aspectthird = aspectInnerFirst2
    aspectfourth = aspectInnerLast2

    cropfirst = cropinnerfirst1
    cropsecond = cropinnerlast1
    cropthird = cropinnerfirst2
    cropfourth = cropinnerlast2
    return (
      <View style={[a.flex_1, true ? a.flex_col : a.flex_row, forwardprop.gap]}>
        <View
          style={[
            {flex: flexoutterfirst * 100},
            false ? a.flex_col : a.flex_row,
            forwardprop.gap,
          ]}>
          <View
            style={[
              {
                flex: flexfirst * 100,
                aspectRatio: aspectfirst,
              },
            ]}>
            <GalleryItem
              {...forwardprop}
              index={0}
              isCropped={cropfirst}
              insetBorderStyle={noCorners([
                'topRight',
                'bottomRight',
                'bottomLeft',
              ])}
            />
          </View>
          <View
            style={[
              {
                flex: flexsecond * 100,
                aspectRatio: aspectsecond,
              },
            ]}>
            <GalleryItem
              {...forwardprop}
              index={1}
              isCropped={cropsecond}
              insetBorderStyle={noCorners([
                'topLeft',
                'bottomRight',
                'bottomLeft',
              ])}
            />
          </View>
        </View>
        <View
          style={[
            {flex: flexoutterlast * 100},
            false ? a.flex_col : a.flex_row,
            forwardprop.gap,
          ]}>
          <View
            style={[
              {
                flex: flexthird * 100,
                aspectRatio: aspectthird,
              },
            ]}>
            <GalleryItem
              {...forwardprop}
              index={2}
              isCropped={cropthird}
              insetBorderStyle={noCorners([
                'bottomRight',
                'topLeft',
                'topRight',
              ])}
            />
          </View>
          <View
            style={[
              {
                flex: flexfourth * 100,
                aspectRatio: aspectfourth,
              },
            ]}>
            <GalleryItem
              {...forwardprop}
              index={3}
              isCropped={cropfourth}
              insetBorderStyle={noCorners([
                'bottomLeft',
                'topLeft',
                'topRight',
              ])}
            />
          </View>
        </View>
      </View>
    )
  } else if (!fourthImg && thirdImg) {
    const {
      desiredMainAxisFirst: flexinnerfirst,
      desiredMainAxisLast: flexinnerlast,
      aspectFirst: aspectInnerFirst,
      aspectLast: aspectInnerLast,
      imgCrop1: cropinnerfirst,
      imgCrop2: cropinnerlast,
    } = calculateLayout({
      img1: calculateAspectRatio(secondImg),
      img2: calculateAspectRatio(thirdImg),
      tryVertical: true,
      unclampedMaxVertical: true,
      desiredAspect: targetratio,
      minPercentMainAxis: 0.25,
      maxPercentMainAxis: 1 - 0.25,
      minPercentCrossAxis: 0.25,
      maxPercentCrossAxis: 1,
    })
    const {
      desiredMainAxisFirst,
      desiredMainAxisLast,
      aspectFirst,
      //aspectLast,
      imgCrop1,
      //imgCrop2,
    } = calculateLayout({
      img1: calculateAspectRatio(firstImg),
      img2: 1 / (aspectInnerFirst + aspectInnerLast),
      //img2: combinedAspect,
      //img2: (1 / (1 / aspectInnerFirst + 1 / aspectInnerLast)),
      //img2: (1 / (1 / calculateAspectRatio(secondImg) + 1 / calculateAspectRatio(thirdImg))),
      tryVertical: false,
      unclampedMaxVertical: false,
      desiredAspect: targetratio,
      minPercentMainAxis: 0.25,
      maxPercentMainAxis: 1 - 0.25,
      minPercentCrossAxis: 0.25,
      maxPercentCrossAxis: 1,
    })

    flexfirst = desiredMainAxisFirst
    flexsecond = flexinnerfirst
    flexthird = flexinnerlast

    flexoutterfirst = desiredMainAxisFirst //flexfirst
    flexoutterlast = desiredMainAxisLast

    aspectfirst = aspectFirst
    // extra clamping
    aspectsecond = Math.max(
      1 / aspectInnerFirst,
      1 / (flexinnerfirst / (flexinnerfirst + flexinnerlast)),
    ) //aspectInnerFirst
    aspectthird = Math.max(
      1 / aspectInnerFirst,
      1 / (flexinnerlast / (flexinnerfirst + flexinnerlast)),
    ) //aspectInnerLast

    cropfirst = imgCrop1
    cropsecond = cropinnerfirst
    cropthird = cropinnerlast
    return (
      <>
        <View
          style={[a.flex_1, false ? a.flex_col : a.flex_row, forwardprop.gap]}>
          <View
            style={[
              {
                flex: flexoutterfirst * 100,
                aspectRatio: aspectfirst,
              },
            ]}>
            <GalleryItem
              {...forwardprop}
              index={0}
              isCropped={cropfirst}
              insetBorderStyle={noCorners(['topRight', 'bottomRight'])}
            />
          </View>
          <View
            style={[
              {flex: flexoutterlast * 100},
              true ? a.flex_col : a.flex_row,
              forwardprop.gap,
            ]}>
            <View
              style={[
                {
                  flex: flexsecond * 100,
                  aspectRatio: aspectsecond,
                },
              ]}>
              <GalleryItem
                {...forwardprop}
                index={1}
                isCropped={cropsecond}
                insetBorderStyle={noCorners([
                  'topLeft',
                  'bottomLeft',
                  'bottomRight',
                ])}
              />
            </View>
            <View
              style={[
                {
                  flex: flexthird * 100,
                  aspectRatio: aspectthird,
                },
              ]}>
              <GalleryItem
                {...forwardprop}
                index={2}
                isCropped={cropthird}
                insetBorderStyle={noCorners([
                  'topLeft',
                  'topRight',
                  'bottomLeft',
                ])}
              />
            </View>
          </View>
        </View>
      </>
    )
  } else {
    const {
      desiredMainAxisFirst,
      desiredMainAxisLast,
      aspectFirst,
      aspectLast,
      imgCrop1,
      imgCrop2,
    } = calculateLayout({
      img1: calculateAspectRatio(firstImg),
      img2: calculateAspectRatio(secondImg),
      tryVertical: false,
      unclampedMaxVertical: false,
      desiredAspect: targetratio,
      minPercentMainAxis: 0.25,
      maxPercentMainAxis: 1 - 0.25,
      minPercentCrossAxis: 0.25,
      maxPercentCrossAxis: 1,
    })

    flexfirst = desiredMainAxisFirst
    flexsecond = desiredMainAxisLast

    aspectfirst = aspectFirst
    aspectsecond = aspectLast

    cropfirst = imgCrop1
    cropsecond = imgCrop2

    return (
      <View
        style={[a.flex_1, false ? a.flex_col : a.flex_row, forwardprop.gap]}>
        <View
          style={[
            {
              flex: flexfirst * 100,
              aspectRatio: aspectfirst,
            },
          ]}>
          <GalleryItem
            {...forwardprop}
            index={0}
            isCropped={cropfirst}
            insetBorderStyle={noCorners(['topLeft', 'bottomLeft'])}
          />
        </View>
        <View
          style={[
            {
              flex: flexsecond * 100,
              aspectRatio: aspectsecond,
            },
          ]}>
          <GalleryItem
            {...forwardprop}
            index={1}
            isCropped={cropsecond}
            insetBorderStyle={noCorners(['topRight', 'bottomRight'])}
          />
        </View>
      </View>
    )
  }
}

function ImageLayoutGridInner(props: ImageLayoutGridInnerProps) {
  return (
    <ImageFlex
      forwardprop={props}
      firstImg={props.images[0]}
      secondImg={props.images[1]}
      thirdImg={props.images[2]}
      fourthImg={props.images[3]}
      targetratio={1}
    />
  )
}

function noCorners(
  corners: ('topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')[],
) {
  const styles: StyleProp<ViewStyle>[] = []
  if (corners.includes('topLeft')) {
    styles.push({borderTopLeftRadius: 0})
  }
  if (corners.includes('topRight')) {
    styles.push({borderTopRightRadius: 0})
  }
  if (corners.includes('bottomLeft')) {
    styles.push({borderBottomLeftRadius: 0})
  }
  if (corners.includes('bottomRight')) {
    styles.push({borderBottomRightRadius: 0})
  }
  return StyleSheet.flatten(styles)
}
