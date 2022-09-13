import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from 'react'
import dynamic from 'next/dynamic'
import { getUserAddressFromLS } from '@/utils/getUserAddressFromLS'

const WagmiProvider = dynamic(() => import('@/components/Wagmi/WagmiProvider'))

const defaultUpdate: Dispatch<SetStateAction<boolean>> = () => true
export const WagmiStatusContext = createContext({
  isWagmiWrapped: false,
  setIsWagmiWrapped: defaultUpdate,
})

export const DynamicWagmiProvider = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) => {
  const [isWagmiWrapped, setIsWagmiWrapped] = useState(
    typeof getUserAddressFromLS() === 'string',
  )

  const value = useMemo(
    () => ({
      isWagmiWrapped,
      setIsWagmiWrapped,
    }),
    [isWagmiWrapped],
  )

  return (
    <>
      <WagmiStatusContext.Provider value={value}>
        {isWagmiWrapped ? <WagmiProvider>{children}</WagmiProvider> : children}
      </WagmiStatusContext.Provider>
    </>
  )
}