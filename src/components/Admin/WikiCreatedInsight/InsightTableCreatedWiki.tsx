import { WIKI_IMAGE_ASPECT_RATIO } from '@/data/Constants'
import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  AspectRatio,
  Icon,
  Tag,
  TagLabel,
  HStack,
  Link,
  useDisclosure,
  Select,
} from '@chakra-ui/react'
import config from '@/config'
import React from 'react'
import shortenAccount from '@/utils/shortenAccount'
import { shortenText } from '@/utils/shortenText'
import { RiArrowDownLine, RiQuestionLine } from 'react-icons/ri'
import { BsDot } from 'react-icons/bs'
import { Wikis } from '@/types/admin'
import { WikiImage } from '../../WikiImage'
import { PromoteCreatedWikisModal } from './PromoteCreatedWikisModal'

type InsightTableWikiCreatedProps = {
  wikiCreatedInsightData: Wikis[]
}

export const InsightTableWikiCreated = (
  props: InsightTableWikiCreatedProps,
) => {
  const { wikiCreatedInsightData } = props
  const { isOpen, onOpen, onClose } = useDisclosure()

  const VisibilityOptions = ['Archive', 'Unarchive']
  return (
    <TableContainer w="100%">
      <Table>
        <Thead bg="wikiTitleBg">
          <Tr>
            <Th color="#718096" textTransform="none" fontWeight="medium">
              Wiki Title
            </Th>
            <Th color="#718096" textTransform="none" fontWeight="medium">
              Date/Time
            </Th>
            <Th color="#718096" textTransform="none" fontWeight="medium">
              Tags
            </Th>
            <Th color="#718096" textTransform="none" fontWeight="medium">
              <HStack spacing={3}>
                <Text>Status</Text>
                <Icon
                  fontSize="10px"
                  cursor="pointer"
                  color="#718096"
                  as={RiArrowDownLine}
                />
              </HStack>
            </Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {wikiCreatedInsightData.map((item, i) => {
            return (
              <Tr key={i}>
                <Td>
                  <Flex flexDir="row" align="center" gap={2}>
                    <AspectRatio ratio={WIKI_IMAGE_ASPECT_RATIO} w="50px">
                      <WikiImage
                        cursor="pointer"
                        flexShrink={0}
                        imageURL={`${config.pinataBaseUrl}${
                          item.images ? item.images[0].id : ''
                        }  `}
                      />
                    </AspectRatio>
                    <Flex flexDirection="column">
                      <Link href={`/wiki/${item.id}`} py={1}>
                        <Text>{shortenText(item.title, 20)}</Text>
                      </Link>
                      <Text color="#718096" fontSize="sm">
                        <Link href={`/account/${item.author.id}`} py={1}>
                          {item.author.profile?.username
                            ? item.author.profile.username
                            : shortenAccount(
                                item.author.id ? item.author.id : '',
                              )}
                        </Link>
                      </Text>
                    </Flex>
                  </Flex>
                </Td>
                <Td>
                  <HStack>
                    <Text color="#718096">
                      {item.created
                        ? new Date(item.created).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </Text>
                    <Icon
                      fontSize="20px"
                      cursor="pointer"
                      color="black"
                      alignSelf="center"
                      as={BsDot}
                      justifySelf="center"
                    />
                    <Text color="#718096" textTransform="lowercase">
                      {item.created
                        ? new Date(item.created).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                          })
                        : '-'}
                    </Text>
                  </HStack>
                </Td>
                <Td py={1}>
                  <HStack
                    marginLeft={-2}
                    flexWrap="wrap"
                    justify="start"
                    gap={2}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      bg="#F9F5FF"
                      color="#FE6FB5"
                    >
                      <TagLabel>Normal</TagLabel>
                    </Tag>
                    {item.promoted && (
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        bg="#EBF8FF"
                        color="#385C8A"
                      >
                        <TagLabel> Promoted </TagLabel>
                      </Tag>
                    )}
                  </HStack>
                </Td>
                <Td>
                  <Tag
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    color={item.hidden ? '#38A169' : '#DD6B20'}
                    bg={item.hidden ? '#F0FFF4' : '#FFF5F5'}
                    px="2"
                  >
                    <HStack spacing={2}>
                      <Icon
                        fontSize="20px"
                        cursor="pointer"
                        color={item.hidden ? '#38A169' : '#DD6B20'}
                        as={BsDot}
                      />
                      <TagLabel>
                        {item.hidden ? 'Archive' : 'Unarchive'}
                      </TagLabel>
                    </HStack>
                  </Tag>
                </Td>
                <Td>
                  <Flex w="100%" p={5} gap={2} align="center">
                    <HStack spacing={5}>
                      <Select
                        maxW="52"
                        ml="auto"
                        defaultValue={item.hidden ? 'Archive' : 'Unarchive'}
                      >
                        {VisibilityOptions?.map((op, p) => (
                          <option key={p}>{op}</option>
                        ))}
                      </Select>

                      {!item.promoted ? (
                        <Text
                          color="#FF5CAA"
                          cursor="pointer"
                          fontWeight="semibold"
                          onClick={() => {
                            onOpen()
                          }}
                        >
                          Promote
                        </Text>
                      ) : (
                        <HStack spacing={2}>
                          <Text color="#E2E8F0" cursor="pointer">
                            Promote
                          </Text>
                          <Icon
                            fontSize="20px"
                            cursor="pointer"
                            color="#718096"
                            as={RiQuestionLine}
                          />
                        </HStack>
                      )}
                    </HStack>
                  </Flex>
                </Td>
              </Tr>
            )
          })}
          <PromoteCreatedWikisModal isOpen={isOpen} onClose={onClose} />
        </Tbody>
      </Table>
    </TableContainer>
  )
}
