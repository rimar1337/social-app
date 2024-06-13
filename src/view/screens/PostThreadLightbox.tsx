import {useNavigation} from '@react-navigation/native'

import {
  CommonNavigatorParams,
  NativeStackScreenProps,
  NavigationProp,
} from '#/lib/routes/types'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'PostThreadLightbox'>
export function PostThreadLightboxScreen({route}: Props) {
  const navigation = useNavigation<NavigationProp>()
  // redirect
  navigation.replace('PostThread', {
    name: route.params.name,
    rkey: route.params.rkey,
  })
  return null
}
