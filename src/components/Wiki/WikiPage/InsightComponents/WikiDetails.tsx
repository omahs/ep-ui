import React from 'react'
import {
  Heading,
  HStack,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Tr,
  TableContainer,
  VStack,
  AspectRatio,
  Wrap,
} from '@chakra-ui/react'
import shortenAccount from '@/utils/shortenAccount'
import { SiIpfs } from 'react-icons/si'
import { GoLink } from 'react-icons/go'
import { WikiImage } from '@/components/WikiImage'
import { Author, BaseCategory, WikiPreview } from '@everipedia/iq-utils'
import Link from '@/components/Elements/LinkElements/Link'
import DisplayAvatar from '@/components/Elements/Avatar/DisplayAvatar'
import { useENSData } from '@/hooks/useENSData'
import config from '@/config'
import { getUsername } from '@/utils/getUsername'
import { WIKI_IMAGE_ASPECT_RATIO } from '@/data/Constants'

export const WikiDetails = ({
  wikiTitle,
  categories,
  createdTime,
  ipfsHash,
  txHash,
  createdBy,
  imgSrc,
  views,
}: {
  wikiTitle: WikiPreview
  categories: BaseCategory[]
  createdTime?: string
  ipfsHash?: string
  txHash?: string
  createdBy?: Author
  imgSrc?: string
  views: number | undefined
}) => {
  const { title, tags } = wikiTitle
  const [, username] = useENSData(createdBy?.id || '')
  return (
    <VStack w="100%" p={4} spacing={4} borderWidth="1px" borderRadius={8}>
      <Heading
        bgColor="wikiTitleBg"
        as="h3"
        fontSize="18px"
        p={3}
        borderRadius={6}
        fontWeight="600"
        w="100%"
        textAlign="center"
        display={{ base: 'none', xl: 'block' }}
      >
        {title}
      </Heading>
      <AspectRatio w="100%" ratio={WIKI_IMAGE_ASPECT_RATIO}>
        <WikiImage bgColor="dimColor" priority imageURL={imgSrc} alt={title} />
      </AspectRatio>
      <TableContainer w="full">
        <Table size="sm" variant="simple">
          <Tbody>
            {categories.length !== 0 && (
              <Tr>
                <Td pt={1} pb={3}>
                  Categories
                </Td>
                <Td pt={1} pb={3}>
                  <HStack flexWrap="wrap" justify="start">
                    {categories?.map((category, i) => (
                      <Link
                        key={i}
                        isExternal
                        href={`/categories/${category.id}`}
                        color="brandLinkColor"
                      >
                        {category.title}
                      </Link>
                    ))}
                  </HStack>
                </Td>
              </Tr>
            )}
            {tags.length !== 0 && (
              <Tr>
                <Td py={1}>Tags</Td>
                <Td py={1}>
                  <Wrap marginLeft={-2} spacing={1}>
                    {tags?.map((tag, i) => (
                      <Link key={i} href={`/tags/${tag.id}`} py={1}>
                        <Tag whiteSpace="nowrap">{tag.id}</Tag>
                      </Link>
                    ))}
                  </Wrap>
                </Td>
              </Tr>
            )}
            <Tr>
              <Td>
                <HStack spacing={3} py="2">
                  <Text>IPFS</Text>
                </HStack>
              </Td>
              <Td display="flex" align="center">
                <HStack gap={1} py="2">
                  <SiIpfs />
                  <Link
                    target="_blank"
                    href={`https://ipfs.everipedia.org/ipfs/${ipfsHash}`}
                    color="brandLinkColor"
                  >
                    <Text>{shortenAccount(ipfsHash || '')}</Text>
                  </Link>
                </HStack>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <HStack spacing={3}>
                  <Text>TX Hash</Text>
                </HStack>
              </Td>
              <Td display="flex" align="center" gap={3}>
                <GoLink />
                <Link
                  target="_blank"
                  href={`${config.blockExplorerUrl}/tx/${txHash}`}
                  color="brandLinkColor"
                >
                  <Text>{shortenAccount(txHash || '')}</Text>
                </Link>
              </Td>
            </Tr>
            <Tr>
              <Td whiteSpace="nowrap">
                <Text py="2">Created</Text>
              </Td>
              <Td>
                <Text>
                  {createdTime
                    ? new Date(createdTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </Text>
              </Td>
            </Tr>
            {createdBy && (
              <Tr>
                <Td whiteSpace="nowrap">
                  <Text py="2">Created By</Text>
                </Td>
                <Td>
                  <HStack py="2">
                    <DisplayAvatar
                      alt={createdBy.profile?.username}
                      address={createdBy.id}
                      avatarIPFS={createdBy.profile?.avatar}
                      size={24}
                    />
                    <Link
                      href={`/account/${createdBy.id}`}
                      color="brandLinkColor"
                    >
                      {getUsername(createdBy, username)}
                    </Link>
                  </HStack>
                </Td>
              </Tr>
            )}
            {views && views > 250 && (
              <Tr>
                <Td whiteSpace="nowrap">
                  <Text py="2">Views</Text>
                </Td>
                <Td>
                  <Text py="2">{views}</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  )
}
