import React from 'react'
import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {s} from '#/lib/styles'
import {useLoggedOutViewControls} from '#/state/shell/logged-out'
import {useCloseAllActiveElements} from '#/state/util'
import {Button} from '#/view/com/util/forms/Button'
import {Text} from '#/view/com/util/text/Text'
import {Logo} from '#/view/icons/Logo'
import {atoms as a, useTheme} from '#/alf'
import {AppLanguageDropdown} from '#/components/AppLanguageDropdown'
import {Link} from '#/components/Link'

let NavSignupCard = ({}: {}): React.ReactNode => {
  const {_} = useLingui()
  const t = useTheme()
  const {requestSwitchToAccount} = useLoggedOutViewControls()
  const closeAllActiveElements = useCloseAllActiveElements()

  const showSignIn = React.useCallback(() => {
    closeAllActiveElements()
    requestSwitchToAccount({requestedAccount: 'none'})
  }, [requestSwitchToAccount, closeAllActiveElements])

  const showCreateAccount = React.useCallback(() => {
    closeAllActiveElements()
    requestSwitchToAccount({requestedAccount: 'new'})
    // setShowLoggedOut(true)
  }, [requestSwitchToAccount, closeAllActiveElements])

  return (
    <View
      style={{
        alignItems: 'flex-start',
        paddingTop: 6,
        marginBottom: 24,
      }}>
      <Link to="/" label="Bluesky - Home">
        <Logo width={48} />
      </Link>

      <View style={{paddingTop: 18}}>
        <Text type="md-bold" style={[t.atoms.text]}>
          <Trans>Sign up or sign in to join the conversation</Trans>
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingTop: 12,
          gap: 8,
        }}>
        <Button
          onPress={showCreateAccount}
          accessibilityHint={_(msg`Sign up`)}
          accessibilityLabel={_(msg`Sign up`)}>
          <Text type="md" style={[{color: 'white'}, s.bold]}>
            <Trans>Sign up</Trans>
          </Text>
        </Button>
        <Button
          type="default"
          onPress={showSignIn}
          accessibilityHint={_(msg`Sign in`)}
          accessibilityLabel={_(msg`Sign in`)}>
          <Text type="md" style={[t.atoms.text, s.bold]}>
            <Trans>Sign in</Trans>
          </Text>
        </Button>
      </View>

      <View style={[a.pt_2xl, a.w_full]}>
        <AppLanguageDropdown />
      </View>
    </View>
  )
}
NavSignupCard = React.memo(NavSignupCard)
export {NavSignupCard}
