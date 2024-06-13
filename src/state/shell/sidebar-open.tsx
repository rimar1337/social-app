import React from 'react'

import * as persisted from '#/state/persisted'

type StateContext = boolean
type SetContext = (v: boolean) => void

const stateContext = React.createContext<StateContext>(false)
const setContext = React.createContext<SetContext>((_: boolean) => {})

function getInitialSidebarState(): boolean {
  const persistedState = persisted.get('isSidebarOpen')
  return persistedState ?? false // Default to false if persisted state is not set
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() =>
    getInitialSidebarState(),
  )

  const setSidebarOpen = React.useCallback((isOpen: boolean) => {
    setIsSidebarOpen(isOpen)
    persisted.write('isSidebarOpen', isOpen)
  }, [])

  return (
    <stateContext.Provider value={isSidebarOpen}>
      <setContext.Provider value={setSidebarOpen}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export function useIsSidebarOpen() {
  return React.useContext(stateContext)
}

export function useSetSidebarOpen() {
  return React.useContext(setContext)
}
