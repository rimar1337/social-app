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
  //let aspectRatio = 16/9
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

function ImageLayoutGridInner(props: ImageLayoutGridInnerProps) {
  const gap = props.gap
  const count = props.images.length
  const cheight = (image: AppBskyEmbedImages.ViewImage) =>
    image?.aspectRatio?.height || 1
  const cwidth = (image: AppBskyEmbedImages.ViewImage) =>
    image?.aspectRatio?.width || 1
  const calculateAspectRatio = (image: AppBskyEmbedImages.ViewImage) =>
    cwidth(image) / cheight(image)
  //let width = 1
  //let height = Math.sqrt(2)
  //let aspectRatio = width / height

  switch (count) {
    case 2:
      const ratio1 = calculateAspectRatio(props.images[0])
      const ratio2 = calculateAspectRatio(props.images[1])

      const totalRatio = ratio1 + ratio2

      const test1 = ratio1 / totalRatio
      const test2 = ratio2 / totalRatio

      const normalize = (value: number) => Math.max(0.25, Math.min(0.75, value))

      const case1 = normalize(test1)
      const case2 = normalize(test2)

      const unbounded1strict: boolean = test1 < 0.25 || test2 > 0.75 // && ratio1 < 0.25
      const unbounded2strict: boolean = test2 < 0.25 || test1 > 0.75 // && ratio2 < 0.25

      const unbounded1: boolean =
        (test1 < 0.25 || test2 > 0.75) && ratio1 < 0.25
      const unbounded2: boolean =
        (test2 < 0.25 || test1 > 0.75) && ratio2 < 0.25

      // vertical layout 2 images
      const aspectRatioImageHeight = (image: AppBskyEmbedImages.ViewImage) =>
        (image.aspectRatio?.height || 1) / (image.aspectRatio?.width || 1)
      const ratio1h = aspectRatioImageHeight(props.images[0])
      const ratio2h = aspectRatioImageHeight(props.images[1])
      const totalRatioh = ratio1h + ratio2h

      const test1h = ratio1h / totalRatioh
      const test2h = ratio2h / totalRatioh

      //const case1h = normalize(test1h)
      //const case2h = normalize(test2h)
      //const shouldstack: boolean = (totalRatioh/(totalRatioh+totalRatio) < totalRatio/(totalRatioh+totalRatio))
      // need to invalidate shouldstack when height is larger than width
      const shouldstack: boolean = totalRatioh < 1 // && ratio1 > 1 && ratio2 > 1
      // should do the same thing as single image but idk
      //const shouldstackStrict: boolean = totalRatioh < 1 // && ratio1 > 1 && ratio2 > 1

      // what am i doing
      // might not need this ???
      // idk im going nuts

      // you dont need this check because if its too tall, we dont letter box, we invalidate shouldstack !
      //const unbounded1h: boolean = (test1h > 0.25 || test2h < 0.75) && ratio1h > 0.25 && false
      //const unbounded2h: boolean = (test2h > 0.25 || test1h < 0.75) && ratio2h > 0.25 && false

      // oops we do if its too short, if its not tall you idiot
      const unbounded1h: boolean = ratio1h < 0.25
      const unbounded2h: boolean = ratio2h < 0.25

      //const unbounded1hdouble: boolean = (test1h < 0.25 || test2h > 0.75)
      //const unbounded2hdouble: boolean = (test2h < 0.25 || test1h > 0.75)
      //const toosmall1: boolean =

      return (
        <View
          style={[
            a.flex_1,
            !shouldstack && a.flex_row,
            gap,
            (!shouldstack ? unbounded1 || unbounded2 : false) && {
              aspectRatio: 1 / 1,
            },
          ]}>
          <View
            style={[
              {
                flex: !shouldstack ? case1 : unbounded1h ? 1 : test1h,
              },
              (!shouldstack ? unbounded1 : unbounded1h)
                ? !shouldstack
                  ? {aspectRatio: 1 / 4}
                  : {aspectRatio: 8 / 1}
                : unbounded2 && {aspectRatio: 3 / totalRatioh},
            ]}>
            <GalleryItem
              {...props}
              imageStyle={[
                (!shouldstack ? unbounded1 : unbounded1h)
                  ? !shouldstack
                    ? {aspectRatio: 1 / 4}
                    : {aspectRatio: 8 / 1}
                  : !shouldstack && unbounded2strict
                  ? {aspectRatio: 3 / totalRatioh}
                  : {
                      aspectRatio:
                        (props.images[0].aspectRatio?.width || 1) /
                        (props.images[0].aspectRatio?.height || 1),
                    },
              ]}
              // imageStyle={{
              //   aspectRatio:
              //     (props.images[0].aspectRatio?.width || 1) /
              //     (props.images[0].aspectRatio?.height || 1),
              // }}
              index={0}
              empty
              // ugh vertis is for unbounded, not for vertical layout
              vertis={!shouldstack ? unbounded1 : false}
              // this is for vertical layout
              //disableFlexOne
              isCropped={
                (!shouldstack ? unbounded1 : unbounded1h)
                  ? true
                  : !shouldstack && unbounded2strict
              }
              insetBorderStyle={noCorners(['topRight', 'bottomRight'])}
            />
          </View>
          <View
            style={[
              {
                flex: !shouldstack ? case2 : unbounded1h ? 1 : test2h,
              },
              (!shouldstack ? unbounded2 : unbounded2h)
                ? !shouldstack
                  ? {aspectRatio: 1 / 4}
                  : {aspectRatio: 8 / 1}
                : unbounded1 && {aspectRatio: 3 / totalRatioh},
            ]}>
            <GalleryItem
              {...props}
              imageStyle={[
                (!shouldstack ? unbounded2 : unbounded2h)
                  ? !shouldstack
                    ? {aspectRatio: 1 / 4}
                    : {aspectRatio: 8 / 1}
                  : !shouldstack && unbounded1strict
                  ? {aspectRatio: 3 / totalRatioh}
                  : {
                      aspectRatio:
                        (props.images[1].aspectRatio?.width || 1) /
                        (props.images[1].aspectRatio?.height || 1),
                    },
              ]}
              // imageStyle={{
              //   aspectRatio:
              //     (props.images[1].aspectRatio?.width || 1) /
              //     (props.images[1].aspectRatio?.height || 1),
              // }}
              index={1}
              empty
              vertis={!shouldstack ? unbounded2 : false}
              isCropped={
                (!shouldstack ? unbounded2 : unbounded2h)
                  ? true
                  : !shouldstack && unbounded1strict
              }
              insetBorderStyle={noCorners(['topLeft', 'bottomLeft'])}
            />
          </View>
        </View>
      )

    case 3:
      const colwidth1t1 = calculateAspectRatio(props.images[0])
      const colwidth2t1 =
        (calculateAspectRatio(props.images[1]) +
          calculateAspectRatio(props.images[2])) /
        2
      const rowheight1t1 = cheight(props.images[0]) / cwidth(props.images[0])
      const rowheight2t1 =
        (1 / calculateAspectRatio(props.images[1]) +
          1 / calculateAspectRatio(props.images[2])) /
        2
      // typed booleans to make it easier to read which ones calculate numbers and which ones handles bools
      const unboundedt1: boolean =
        rowheight1t1 + rowheight2t1 > colwidth1t1 + colwidth2t1

      const colwidth1t2 =
        (calculateAspectRatio(props.images[0]) +
          calculateAspectRatio(props.images[1])) /
        2
      const colwidth2t2 = calculateAspectRatio(props.images[2])
      const rowheight1t2 =
        (1 / calculateAspectRatio(props.images[0]) +
          1 / calculateAspectRatio(props.images[1])) /
        2
      // const rowheight1t2 =
      //   (cheight(props.images[0]) / cwidth(props.images[1]) +
      //     cheight(props.images[1]) / cwidth(props.images[2])) /
      //   2
      const rowheight2t2 = cheight(props.images[2]) / cwidth(props.images[0])

      const unboundedt2: boolean =
        rowheight1t2 + rowheight2t2 > colwidth1t2 + colwidth2t2

      const equals: boolean =
        calculateAspectRatio(props.images[0]) ===
          calculateAspectRatio(props.images[1]) &&
        calculateAspectRatio(props.images[1]) ===
          calculateAspectRatio(props.images[2])

      const avg =
        (calculateAspectRatio(props.images[0]) +
          calculateAspectRatio(props.images[1]) +
          calculateAspectRatio(props.images[2])) /
        3

      const clampt = avg < 1

      const bigleft: boolean =
        colwidth2t2 / (colwidth1t2 + colwidth2t2) <
        colwidth1t1 / (colwidth1t1 + colwidth2t1)

      const cropt1: boolean =
        ((unboundedt1 ||
          colwidth2t1 !== colwidth1t1 ||
          rowheight2t1 !== rowheight1t1) &&
          !equals) ||
        clampt

      const cropt2: boolean =
        ((unboundedt2 ||
          colwidth2t2 !== colwidth1t2 ||
          rowheight2t2 !== rowheight1t2) &&
          !equals) ||
        clampt

      // unused cloned from 4grid
      //const tempbigwidthpercent = Math.max(bigleft ? colwidth1t1/(colwidth1t1/colwidth2t1) : colwidth2t1/(colwidth2t1/colwidth1t1), 0.25)
      //const tempsmallwidthpercent = Math.max(bigleft ? colwidth1t1/(colwidth1t1/colwidth2t1) : colwidth2t1/(colwidth2t1/colwidth1t1), 0.25)
      //const wrong: boolean = tempsmallwidthpercent > tempbigwidthpercent
      //const tempsumt = tempsmallwidthpercent + tempbigwidthpercent
      //const awful: boolean = tempsumt > 1

      // clamping to fit in 1/1 in a way that the 25% doesnt get smaller
      //const bigwidthpercent = awful ? (wrong ? tempbigwidthpercent : 1 - tempsmallwidthpercent) : tempbigwidthpercent
      //const smallwidthpercent = awful ? (wrong ? 1 - tempbigwidthpercent : tempsmallwidthpercent) : tempsmallwidthpercent

      //const unboundedf: boolean = rowheight1f + rowheight2f > colwidth1f + colwidth2f

      return (
        <View
          style={[
            a.flex_1,
            a.flex_row,
            gap,
            {
              //equals ?
              aspectRatio:
                //  ? ((props.images[0].aspectRatio?.width || 1) /
                //    ((props.images[0].aspectRatio?.width || 1) *
                //      (props.images[0].aspectRatio?.height || 1))) /
                //((props.images[0].aspectRatio?.width || 1) /(props.images[0].aspectRatio?.height || 1))*3/2
                //: 3 / 2,
                Math.min(clampt ? 1 : (avg * 3) / 2, 3),
            },
          ]}>
          {bigleft || equals ? (
            <>
              <View
                style={[
                  {
                    flex: (colwidth1t1 * 99 * 2) / 3,
                    aspectRatio: unboundedt1
                      ? colwidth1t1 /
                        (rowheight1t1 * (colwidth1t1 + colwidth1t1))
                      : colwidth1t1 / rowheight1t1,
                  },
                ]}>
                <GalleryItem
                  {...props}
                  index={0}
                  vertis={unboundedt1}
                  isCropped={cropt1}
                  insetBorderStyle={noCorners([
                    'bottomLeft',
                    'topRight',
                    'bottomRight',
                  ])}
                />
              </View>
              <View
                style={[
                  a.flex_col,
                  gap,
                  {
                    flex: Math.min(
                      (colwidth2t1 * 99 * 1) / 3,
                      (colwidth2t1 * 99 * 4) / 3,
                    ),
                  },
                ]}>
                <View
                  style={[
                    {
                      flex: rowheight2t1,
                      aspectRatio: Math.min(
                        unboundedt1
                          ? colwidth2t1 /
                              ((rowheight1t1 / rowheight2t1) *
                                (colwidth2t1 + colwidth2t1))
                          : colwidth2t1 / rowheight1t1,
                        2,
                      ),
                    },
                  ]}>
                  <GalleryItem
                    {...props}
                    index={1}
                    vertis={unboundedt1}
                    isCropped={cropt1}
                    insetBorderStyle={noCorners([
                      'topLeft',
                      'topRight',
                      'bottomRight',
                    ])}
                  />
                </View>
                <View
                  style={[
                    {
                      flex: rowheight2t1,
                      aspectRatio: Math.min(
                        unboundedt1
                          ? colwidth2t1 /
                              ((rowheight1t1 / rowheight2t1) *
                                (colwidth2t1 + colwidth2t1))
                          : colwidth2t1 / rowheight2t1,
                        2,
                      ),
                    },
                  ]}>
                  <GalleryItem
                    {...props}
                    index={2}
                    vertis={unboundedt1}
                    isCropped={cropt1}
                    insetBorderStyle={noCorners([
                      'topLeft',
                      'bottomLeft',
                      'topRight',
                    ])}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View
                style={[
                  a.flex_col,
                  gap,
                  {
                    flex: Math.min(
                      (colwidth1t2 * 99 * 1) / 3,
                      (colwidth2t2 * 99 * 4) / 3,
                    ),
                  },
                ]}>
                <View
                  style={[
                    {
                      flex: rowheight1t2,
                      aspectRatio: Math.min(
                        unboundedt2
                          ? colwidth1t2 /
                              ((rowheight2t2 / rowheight1t2) *
                                (colwidth1t2 + colwidth1t2))
                          : colwidth2t1 / rowheight1t1,
                        2,
                      ),
                    },
                  ]}>
                  <GalleryItem
                    {...props}
                    index={0}
                    vertis={unboundedt2}
                    isCropped={cropt2}
                    insetBorderStyle={noCorners([
                      'topLeft',
                      'topRight',
                      'bottomRight',
                    ])}
                  />
                </View>
                <View
                  style={[
                    {
                      flex: rowheight1t2,
                      aspectRatio: Math.min(
                        unboundedt2
                          ? colwidth1t2 /
                              ((rowheight2t2 / rowheight1t2) *
                                (colwidth1t2 + colwidth1t2))
                          : colwidth2t1 / rowheight2t1,
                        2,
                      ),
                    },
                  ]}>
                  <GalleryItem
                    {...props}
                    index={1}
                    vertis={unboundedt2}
                    isCropped={cropt2}
                    insetBorderStyle={noCorners([
                      'topLeft',
                      'bottomLeft',
                      'topRight',
                    ])}
                  />
                </View>
              </View>
              <View
                style={[
                  {
                    flex: (colwidth2t2 * 99 * 2) / 3,
                    aspectRatio: unboundedt2
                      ? colwidth2t2 /
                        (rowheight2t2 * (colwidth2t2 + colwidth2t2))
                      : colwidth2t2 / rowheight2t2,
                  },
                ]}>
                <GalleryItem
                  {...props}
                  index={2}
                  vertis={unboundedt2}
                  isCropped={cropt2}
                  insetBorderStyle={noCorners([
                    'bottomLeft',
                    'topRight',
                    'bottomRight',
                  ])}
                />
              </View>
            </>
          )}
        </View>
      )

    case 4:
      const colwidth1f =
        (calculateAspectRatio(props.images[0]) +
          calculateAspectRatio(props.images[2])) /
        2
      const colwidth2f =
        (calculateAspectRatio(props.images[1]) +
          calculateAspectRatio(props.images[3])) /
        2
      const rowheight1f =
        (1 / calculateAspectRatio(props.images[0]) +
          1 / calculateAspectRatio(props.images[1])) /
        2
      const rowheight2f =
        (1 / calculateAspectRatio(props.images[2]) +
          1 / calculateAspectRatio(props.images[3])) /
        2

      // column width percent clamping to 25%
      const tempcolpercent1f = Math.max(
        colwidth1f / (colwidth1f + colwidth2f),
        0.25,
      ) // 0.5
      const tempcolpercent2f = Math.max(
        colwidth2f / (colwidth1f + colwidth2f),
        0.25,
      ) // 0.5
      const tempsumtallpercentf = tempcolpercent1f + tempcolpercent2f
      const tootallf: boolean = tempsumtallpercentf > 1
      const oneissmallerrf: boolean = tempcolpercent1f < tempcolpercent2f

      // clamping to fit in 1/1 in a way that the 25% doesnt get smaller
      const colpercent1f: number = tootallf
        ? oneissmallerrf
          ? tempcolpercent1f
          : 1 - tempcolpercent2f
        : tempcolpercent1f
      const colpercent2f: number = tootallf
        ? oneissmallerrf
          ? 1 - tempcolpercent1f
          : tempcolpercent2f
        : tempcolpercent2f

      // this will get us a fraction, height of an image
      // percent height of all items here. should be the same but im keeping both here just to be safe
      const i11hf = rowheight1f * colpercent1f // 9/16 * 0.5 = 9/32 = 0.28125
      const i12hf = rowheight1f * colpercent2f // 9/16 * 0.5 = 9/32 = 0.28125

      const postrowheight1f = (i11hf + i12hf) / 2 // 9/32 28.125% of container width is row 1 height

      const i21hf = rowheight2f * colpercent1f // 9/16 * 0.5 = 9/32 = 0.28125
      const i22hf = rowheight2f * colpercent2f // 9/16 * 0.5 = 9/32 = 0.28125

      const postrowheight2f = (i21hf + i22hf) / 2 // 9/32 28.125% of container width is row 2 height

      // in percents
      const totalheightf = postrowheight1f + postrowheight2f // 9/16 so it means 56.25% of width = container height

      // height of the entire container
      const unboundednewf: boolean = totalheightf > 1
      //const desiredheightf = unboundednew ? 1 : totalheightf // 9/16 which again is a number relative to the width

      // percent of desired height, constrained to 1/1
      // clamping
      const tempdesiredheight1f = unboundednewf
        ? postrowheight1f / totalheightf
        : Math.max(postrowheight1f, 0.25) // (9/32)/(9/16)=0.5
      const tempdesiredheight2f = unboundednewf
        ? postrowheight2f / totalheightf
        : Math.max(postrowheight2f, 0.25) // (9/32)/(9/16)=0.5

      const tempsumtallf = tempdesiredheight1f + tempdesiredheight2f
      const tootallagainf: boolean = tempsumtallf > 1
      const oneissmallerf: boolean = tempdesiredheight1f < tempdesiredheight2f

      // clamping to fit in 1/1 in a way that the 25% doesnt get smaller
      const desiredheight1f = tootallagainf
        ? oneissmallerf
          ? tempdesiredheight1f
          : 1 - tempdesiredheight2f
        : tempdesiredheight1f
      const desiredheight2f = tootallagainf
        ? oneissmallerf
          ? 1 - tempdesiredheight1f
          : tempdesiredheight2f
        : tempdesiredheight2f

      const unboundedf: boolean =
        rowheight1f + rowheight2f > colwidth1f + colwidth2f

      return (
        <>
          <View
            style={[
              a.flex_row,
              gap,
              {
                flex: desiredheight1f * 99,
              },
            ]}>
            <View
              style={[
                {
                  flex: colpercent1f * 99,
                  aspectRatio: colpercent1f / desiredheight1f,
                },
              ]}>
              <GalleryItem
                {...props}
                index={0}
                vertis={unboundedf}
                isCropped={
                  unboundedf ||
                  colwidth1f !== colwidth2f ||
                  rowheight1f !== rowheight2f
                }
                insetBorderStyle={noCorners([
                  'bottomLeft',
                  'topRight',
                  'bottomRight',
                ])}
              />
            </View>
            <View
              style={[
                {
                  flex: colpercent2f * 99,
                  aspectRatio: colpercent2f / desiredheight1f,
                },
              ]}>
              <GalleryItem
                {...props}
                index={1}
                vertis={unboundedf}
                isCropped={
                  unboundedf ||
                  colwidth1f !== colwidth2f ||
                  rowheight1f !== rowheight2f
                }
                insetBorderStyle={noCorners([
                  'topLeft',
                  'bottomLeft',
                  'bottomRight',
                ])}
              />
            </View>
          </View>
          <View
            style={[
              a.flex_row,
              gap,
              {
                flex: desiredheight2f * 99,
              },
            ]}>
            <View
              style={[
                {
                  flex: colpercent1f * 99,
                  aspectRatio: colpercent1f / desiredheight2f,
                },
              ]}>
              <GalleryItem
                {...props}
                index={2}
                vertis={unboundedf}
                isCropped={
                  unboundedf ||
                  colwidth1f !== colwidth2f ||
                  rowheight1f !== rowheight2f
                }
                insetBorderStyle={noCorners([
                  'topLeft',
                  'topRight',
                  'bottomRight',
                ])}
              />
            </View>
            <View
              style={[
                {
                  flex: colpercent2f * 99,
                  aspectRatio: colpercent2f / desiredheight2f,
                },
              ]}>
              <GalleryItem
                {...props}
                index={3}
                vertis={unboundedf}
                isCropped={
                  unboundedf ||
                  colwidth1f !== colwidth2f ||
                  rowheight1f !== rowheight2f
                }
                insetBorderStyle={noCorners([
                  'topLeft',
                  'bottomLeft',
                  'topRight',
                ])}
              />
            </View>
          </View>
        </>
      )

    default:
      return null
  }
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
