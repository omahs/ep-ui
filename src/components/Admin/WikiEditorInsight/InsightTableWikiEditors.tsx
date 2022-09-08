import config from '@/config'
import { WIKI_IMAGE_ASPECT_RATIO } from '@/data/Constants'
import {
  Flex,
  Table,
  TableContainer,
  Avatar,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  AspectRatio,
  useDisclosure,
  Link,
  Box,
  Tag,
  HStack,
  Icon,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import shortenAccount from '@/utils/shortenAccount'
import { shortenText } from '@/utils/shortenText'
import { RiQuestionLine } from 'react-icons/ri'
import { WikiImage } from '../../WikiImage'

interface WikiEditorInsightDataInterface {
  editorName: string
  createdWikis: {
    content: {
      title: string
      images: {
        id: string
      }[]
    }[]
    datetime: string
    id: string
    ipfs: string
    wikiId: string
  }[]
  editiedWikis: {
    content: {
      title: string
      images: {
        id: string
      }[]
    }[]
    datetime: string
    id: string
    ipfs: string
    wikiId: string
  }[]
  lastCreatedWiki: {
    content: {
      title: string
      images: {
        id: string
      }[]
    }[]
  }
  editorAvatar: string
  latestActivity: string
  editorAddress: string
  active: boolean
}

type InsightTableWikiEditorsProps = {
  wikiInsightData: WikiEditorInsightDataInterface[] | undefined
  toggleUserFunc: (active: boolean, id: string) => void
  filterBy: string
}

export const InsightTableWikiEditors = (
  props: InsightTableWikiEditorsProps,
) => {
  const { wikiInsightData: wikiEditorInsightData } = props
  const { toggleUserFunc, filterBy } = props

  const filterBoolean = useMemo(() => {
    if (filterBy === 'Banned') {
      return false
    }
    if (filterBy === 'Active') {
      return true
    }
    return ''
  }, [filterBy])

  const { onOpen } = useDisclosure()
  return wikiEditorInsightData && wikiEditorInsightData?.length > 0 ? (
    <TableContainer w="100%">
      <Table>
        <Thead bg="wikiTitleBg">
          <Tr>
            <Th
              color="#718096"
              textTransform="capitalize"
              fontWeight="semibold"
            >
              <Text fontWeight="bold">Names</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="normal">
              <Text fontWeight="bold">No. of created wikis</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="medium">
              <Text fontWeight="bold">No. of edited wikis</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="medium">
              <Text fontWeight="bold">Total No. of wikis</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="medium">
              <Text fontWeight="bold">Last created wiki</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="medium">
              <Text fontWeight="bold">Lastest activity</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="medium">
              <Text fontWeight="bold">Status</Text>
            </Th>
            <Th color="#718096" textTransform="capitalize" fontWeight="medium">
              Action
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {wikiEditorInsightData
            .filter(item =>
              filterBy.length > 0
                ? item.active === filterBoolean
                : item.createdWikis,
            )
            ?.map((item, i) => {
              return (
                <Tr key={i}>
                  <Td>
                    <Link href={`/account/${item.editorAddress}`} py={1}>
                      <Flex align="center" gap={2}>
                        <Avatar
                          boxSize="40px"
                          name={item.editorName}
                          src={item.editorAvatar}
                        />
                        <Flex flexDirection="column">
                          <Text>{item.editorName}</Text>
                          <Text color="#718096" fontSize="sm">
                            {shortenAccount(item.editorAddress)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Link>
                  </Td>
                  <Td>
                    <Text color="#718096">{item.createdWikis.length}</Text>
                  </Td>
                  <Td>
                    <Text color="#718096">{item.editiedWikis.length}</Text>
                  </Td>
                  <Td>
                    <Text color="#718096">
                      {item.createdWikis.length + item.editiedWikis.length}
                    </Text>
                  </Td>
                  <Td>
                    <Link href={`/wiki/${item.editiedWikis[0]?.wikiId}`} py={1}>
                      <Flex flexDir="row" align="center" gap={2}>
                        <AspectRatio ratio={WIKI_IMAGE_ASPECT_RATIO} w="40px">
                          <WikiImage
                            cursor="pointer"
                            flexShrink={0}
                            imageURL={`${config.pinataBaseUrl}${
                              item.lastCreatedWiki?.content
                                ? item.lastCreatedWiki.content[0].images[0].id
                                : ''
                            }`}
                          />
                        </AspectRatio>
                        <Text>
                          {item.lastCreatedWiki?.content[0]
                            ? shortenText(
                                item.lastCreatedWiki?.content[0].title,
                                18,
                              )
                            : ''}
                        </Text>
                      </Flex>
                    </Link>
                  </Td>
                  <Td color="#718096">{item.latestActivity}</Td>
                  <Td>
                    <Tag colorScheme={item.active ? 'green' : 'red'}>
                      {item.active ? 'Active' : 'Banned'}
                    </Tag>
                  </Td>
                  <Td>
                    {item.active ? (
                      <Text
                        cursor="pointer"
                        fontWeight="medium"
                        onClick={() => {
                          onOpen()
                          toggleUserFunc(item.active, item.editorAddress)
                        }}
                      >
                        Ban
                      </Text>
                    ) : (
                      <HStack
                        spacing={2}
                        onClick={() =>
                          toggleUserFunc(item.active, item.editorAddress)
                        }
                      >
                        <Text
                          color="#E2E8F0"
                          _dark={{ color: '#495a68' }}
                          cursor="pointer"
                        >
                          Ban
                        </Text>
                        <Icon
                          fontSize="20px"
                          cursor="pointer"
                          color="#F11a82"
                          as={RiQuestionLine}
                        />
                      </HStack>
                    )}
                  </Td>
                </Tr>
              )
            })}
        </Tbody>
      </Table>
    </TableContainer>
  ) : (
    <Box textAlign="center" w="100%">
      <Text>No data to display 🐌</Text>
    </Box>
  )
}
