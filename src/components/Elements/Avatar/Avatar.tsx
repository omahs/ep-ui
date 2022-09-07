import React, { useEffect } from 'react'
import CustomAvatar from 'boring-avatars'
import {
  Avatar,
  Center,
  ChakraProps,
  CSSObject,
  HTMLChakraProps,
  Icon,
} from '@chakra-ui/react'
import { AvatarColorArray } from '@/data/AvatarData'
import { RiUserLine } from 'react-icons/ri'
import { useENSData } from '@/hooks/useENSData'
import config from '@/config'
import { useUserProfileData } from '@/services/profile/utils'
import { Image, NextChakraImageProps } from '../Image/Image'

type DisplayAvatarProps = ChakraProps & {
  address?: string | null
  svgProps?: CSSObject
  avatarIPFS?: string | null
  wrapperProps?: HTMLChakraProps<'span'>
  size?: number | string
}
const DisplayAvatar = ({
  address,
  svgProps,
  avatarIPFS,
  wrapperProps,
  size = 26,
  ...rest
}: DisplayAvatarProps) => {
  const [avatar] = useENSData(
    address,
    avatarIPFS ? avatarIPFS?.length > 0 : false,
  )

  const { avatar: fetchedAvatarIPFS, setAccount } = useUserProfileData(
    undefined,
    {
      onlyAvatar: true,
    },
  )
  let content = null

  useEffect(() => {
    if (address && !avatarIPFS) {
      setAccount(address)
    }
  }, [address, avatarIPFS, setAccount])

  if (avatarIPFS || fetchedAvatarIPFS) {
    content = (
      <Image
        h={`${size}px`}
        w={`${size}px`}
        src={`${config.pinataBaseUrl}${avatarIPFS || fetchedAvatarIPFS}`}
        borderRadius="full"
        {...(rest as Omit<NextChakraImageProps, 'src'>)}
      />
    )
  } else if (avatar) {
    content = <Avatar h={`${size}px`} w={`${size}px`} src={avatar} {...rest} />
  } else if (address && !avatar) {
    content = (
      <CustomAvatar
        size={size}
        variant="pixel"
        name="Unnamed"
        colors={AvatarColorArray}
      />
    )
  } else {
    content = (
      <Icon
        cursor="pointer"
        fontSize={size}
        color="gray.600"
        _dark={{ color: 'gray.200' }}
        fontWeight={600}
        as={RiUserLine}
      />
    )
  }

  return (
    <Center
      {...wrapperProps}
      sx={{
        svg: {
          ...svgProps,
        },
      }}
      borderRadius="full"
    >
      {content}
    </Center>
  )
}

export default DisplayAvatar
