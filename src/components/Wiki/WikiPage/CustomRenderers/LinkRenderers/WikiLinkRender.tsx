import { WikiImage } from '@/components/WikiImage'
import { useGetWikiPreviewQuery } from '@/services/wikis'
import { getWikiImageUrl } from '@/utils/getWikiImageUrl'
import { getWikiSummary } from '@/utils/getWikiSummary'
import {
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import { RiLightbulbLine, RiPriceTagLine } from 'react-icons/ri'

const WikiLinkPreviewSkeleton = () => (
  <>
    <PopoverHeader>
      <HStack justify="center" opacity={0.8}>
        <Skeleton boxSize={5} /> <Skeleton h={5} w={20} />
      </HStack>
    </PopoverHeader>
    <PopoverBody>
      <HStack align="start" spacing={3}>
        <Skeleton boxSize={20} flexShrink={0} />
        <VStack w="full">
          <Skeleton h={5} w="full" />
          <Skeleton h={5} w="full" />
          <Skeleton h={5} w="full" />
        </VStack>
      </HStack>
    </PopoverBody>
    <PopoverFooter>
      <HStack spacing={2} align="center" flexWrap="wrap">
        <Skeleton h={5} w={10} />
        <Skeleton h={5} w={10} />
        <Skeleton h={5} w={10} />
      </HStack>
    </PopoverFooter>
  </>
)

const WikiLinkPreview = ({ wikiId }: { wikiId: string }) => {
  const { data: wiki, isLoading } = useGetWikiPreviewQuery(wikiId)
  return (
    <PopoverContent
      boxShadow="rgb(4 17 29 / 25%) 0px 0px 8px 0px"
      _focus={{ outline: 'none' }}
      mx={4}
    >
      <PopoverArrow />
      {!isLoading ? (
        <>
          <PopoverHeader>
            <HStack justify="center" opacity={0.8}>
              <Icon as={RiLightbulbLine} />{' '}
              <Text fontSize="15px">{wiki?.title}</Text>
            </HStack>
          </PopoverHeader>
          <PopoverBody>
            <HStack align="start" spacing={3}>
              <WikiImage
                mt={1}
                borderRadius={2}
                overflow="hidden"
                flexShrink={0}
                w="100px"
                h="100px"
                imageURL={getWikiImageUrl(wiki?.images)}
                alt={wiki?.title || 'wiki'}
              />
              <Text fontSize="14px">{wiki && getWikiSummary(wiki)}</Text>
            </HStack>
          </PopoverBody>
          {wiki?.tags?.length !== 0 && (
            <PopoverFooter>
              <HStack spacing={2} align="center" flexWrap="wrap">
                <Tag variant="outline">
                  <TagLeftIcon mr={1} boxSize="12px" as={RiPriceTagLine} />
                  <TagLabel ml={0} fontSize="12px">
                    TAGS
                  </TagLabel>
                </Tag>
                {wiki?.tags?.map((tag, i) => (
                  <Tag
                    key={i}
                    bgColor={`hsl(${Math.floor(i * 0.5 * 360)}, 40%, 80%)`}
                    color="black"
                  >
                    {tag.id}
                  </Tag>
                ))}
              </HStack>
            </PopoverFooter>
          )}
        </>
      ) : (
        <WikiLinkPreviewSkeleton />
      )}
    </PopoverContent>
  )
}

const WikiLinkRender = ({
  href,
  text,
  slug,
}: {
  href: string
  text: string
  slug: string
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      returnFocusOnClose={false}
      aria-label="Wiki preview"
    >
      <PopoverTrigger>
        <a
          ref={linkRef}
          onMouseOver={() => setIsOpen(true)}
          onMouseOut={() => setIsOpen(false)}
          onFocus={() => {}}
          onBlur={() => {}}
          href={href}
          color="brandLinkColor"
        >
          {text}
        </a>
      </PopoverTrigger>
      {isOpen && <WikiLinkPreview wikiId={slug} />}
    </Popover>
  )
}

export default WikiLinkRender
