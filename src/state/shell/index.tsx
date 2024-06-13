import React from 'react'

import {Provider as ColorModeProvider} from './color-mode'
import {Provider as ComposerProvider} from './composer'
import {Provider as DrawerOpenProvider} from './drawer-open'
import {Provider as DrawerSwipableProvider} from './drawer-swipe-disabled'
import {Provider as MinimalModeProvider} from './minimal-mode'
import {Provider as OnboardingProvider} from './onboarding'
import {Provider as ShellLayoutProvder} from './shell-layout'
import {Provider as SidebarOpenProvider} from './sidebar-open'
import {Provider as TickEveryMinuteProvider} from './tick-every-minute'

export {useSetThemePrefs, useThemePrefs} from './color-mode'
export {useComposerControls, useComposerState} from './composer'
export {useIsDrawerOpen, useSetDrawerOpen} from './drawer-open'
export {
  useIsDrawerSwipeDisabled,
  useSetDrawerSwipeDisabled,
} from './drawer-swipe-disabled'
export {useMinimalShellMode, useSetMinimalShellMode} from './minimal-mode'
export {useOnboardingDispatch, useOnboardingState} from './onboarding'
export {useTickEveryMinute} from './tick-every-minute'
export function Provider({children}: React.PropsWithChildren<{}>) {
  return (
    <ShellLayoutProvder>
      <DrawerOpenProvider>
        <SidebarOpenProvider>
          <DrawerSwipableProvider>
            <MinimalModeProvider>
              <ColorModeProvider>
                <OnboardingProvider>
                  <ComposerProvider>
                    <TickEveryMinuteProvider>
                      {children}
                    </TickEveryMinuteProvider>
                  </ComposerProvider>
                </OnboardingProvider>
              </ColorModeProvider>
            </MinimalModeProvider>
          </DrawerSwipableProvider>
        </SidebarOpenProvider>
      </DrawerOpenProvider>
    </ShellLayoutProvder>
  )
}
