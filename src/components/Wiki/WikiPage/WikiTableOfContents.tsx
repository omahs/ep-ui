import React from 'react'
import {
  VStack,
  Text,
  Link,
  useDisclosure,
  IconButton,
  Flex,
  Box,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react'
import { RiMenu3Fill } from 'react-icons/ri'
import { useAppSelector } from '@/store/hook'
import { StaticContent } from '@/components/StaticElement'

interface WikiTableOfContentsProps {
  isAlertAtTop?: boolean
}

const WikiTableOfContents = ({ isAlertAtTop }: WikiTableOfContentsProps) => {
  const toc = useAppSelector(state => state.toc)

  const { colorMode } = useColorMode()
  const { isOpen, onToggle } = useDisclosure()
  const isDefaultOpen = useBreakpointValue({ base: false, xs: true, xl: false })
  const [activeId, setActiveId] = React.useState<string | null>()

  // the below ref is used to store all the heading that are in view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headingElementsRef: any = React.useRef({})

  React.useEffect(() => {
    // get all the heading elements
    const headingElements = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    )

    // defining callback function for intersection observer
    // this function will be called when the heading element is in view
    // hence when the heading element is in view,
    // we will set the activeId to the id of the heading element
    const callback: IntersectionObserverCallback = headings => {
      headingElementsRef.current = headings.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement
        return map
      }, headingElementsRef.current)

      // get the id of the heading element that is in view
      const visibleHeadings: IntersectionObserverEntry[] = []
      Object.keys(headingElementsRef.current).forEach(key => {
        const headingElement: IntersectionObserverEntry =
          headingElementsRef.current[key]
        if (headingElement.isIntersecting) visibleHeadings.push(headingElement)
      })

      const getIndexFromId = (id: string) =>
        headingElements.findIndex(heading => heading.id === id)

      // setting the activeId to the id of the heading element that is in view
      if (visibleHeadings.length === 1) {
        setActiveId(visibleHeadings[0].target.id)
      } else if (visibleHeadings.length > 1) {
        // if there are multiple heading elements in view then set heading near to top as active
        let closestHeading: IntersectionObserverEntry = visibleHeadings[0]
        visibleHeadings.forEach(headingElement => {
          if (
            closestHeading === undefined ||
            getIndexFromId(closestHeading.target.id) >
              getIndexFromId(headingElement.target.id)
          ) {
            closestHeading = headingElement
          }
        })
        setActiveId(closestHeading.target.id)
      }
    }

    // creating intersection observer instance and observing the heading elements
    const observer = new IntersectionObserver(callback, {
      rootMargin: '-100px 0px 0px 0px',
    })
    headingElements.forEach(element => observer.observe(element))

    return () => observer.disconnect()
  }, [setActiveId, toc])

  React.useEffect(() => {
    if (!activeId) setActiveId(toc[0]?.id)
  }, [activeId, toc])

  if (isOpen === isDefaultOpen) {
    return (
      <VStack
        display={{ base: 'none', xl: 'block' }}
        borderLeftWidth="1px"
        w="20vw"
        px={6}
        py="30px"
        ml="0 !important"
      >
        <VStack
          spacing={4}
          align="start"
          position="sticky"
          top="calc(70px + 30px + 2px)"
        >
          <Flex w="100%" justify="end">
            <IconButton
              aria-label="Toggle Table of Contents"
              icon={<RiMenu3Fill />}
              onClick={onToggle}
            />
          </Flex>
          <StaticContent>
            <VStack
              as="nav"
              spacing={4}
              h="calc(100vh - (70px + 90px))"
              overflowY="scroll"
              pr={4}
              w="100%"
              align="start"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: colorMode === 'light' ? '#0000002a' : '#3f444e',
                  borderRadius: '24px',
                },
              }}
            >
              {toc.map(({ level, id, title }) => (
                <Box key={id} pl={`calc(${(level - 1) * 20}px)`}>
                  <Text
                    color={activeId === id ? 'brandLinkColor' : 'unset'}
                    boxShadow={
                      activeId === id ? '-2px 0px 0px 0px #ff5caa' : '0'
                    }
                    outlineColor="brandLinkColor"
                    pl={2}
                  >
                    <Link href={`#${id}`}>{title}</Link>
                  </Text>
                </Box>
              ))}
            </VStack>
          </StaticContent>
        </VStack>
      </VStack>
    )
  }
  return (
    <Box
      display={{ base: 'none', md: 'block' }}
      pos="absolute"
      right="24px"
      top={`calc(70px + ${isAlertAtTop ? '80px' : '32px'})`}
    >
      <IconButton
        aria-label="Toggle Table of Contents"
        icon={<RiMenu3Fill />}
        onClick={onToggle}
      />
    </Box>
  )
}

export default WikiTableOfContents
