import { BrandingAssets } from '@/components/Branding/BrandingAssets'
import {
  Box,
  Flex,
  Heading,
  Text,
  List,
  ListIcon,
  ListItem,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { Image } from '../../components/Elements/Image/Image'

const BrandingPage = () => {
  const [currentViewedAsset, setCurrentViewedAsset] = useState<string>('kdkd')
  const IQLogoAsset = [
    {
      bg: '/branding/iqoriginal.png',
      download: '/branding/downloadassets/logoiqoriginal',
    },
    {
      bg: '/branding/iqwhite.png',
      download: '/branding/downloadassets/logoiqwhite',
    },
    {
      bg: '/branding/iqblue.png',
      download: '/branding/downloadassets/logoiqblue',
    },
    {
      bg: '/branding/iqpurple.png',
      download: '/branding/downloadassets/logoiqpurple',
    },
    {
      bg: '/branding/iqdeepblack.png',
      download: '/branding/downloadassets/logoiqdeepblack',
    },
    {
      bg: '/branding/iqnegativepink.png',
      download: '/branding/downloadassets/logoiqnegativepink',
    },
    {
      bg: '/branding/iqpink.png',
      download: '/branding/downloadassets/logoiqpink',
    },
    {
      bg: '/branding/iqnegativewhite.png',
      download: '/branding/downloadassets/logoiqnegativewhite',
    },
    {
      bg: '/branding/iqBlack.png',
      download: '/branding/downloadassets/logoiqblack',
    },
    {
      bg: '/branding/iqred.png',
      download: '/branding/downloadassets/logoiqred',
    },
    {
      bg: '/branding/iqgreen.png',
      download: '/branding/downloadassets/logoiqgreen',
    },
    {
      bg: '/branding/iqorange.png',
      download: '/branding/downloadassets/logoiqorange',
    },
  ]
  const alternateTextAssets = [
    {
      bg: '/branding/brainpink.png',
      download: '/branding/downloadassets/logobrainpink',
    },
    {
      bg: '/branding/brainwhite.png',
      download: '/branding/downloadassets/logobrainwhite',
    },
    {
      bg: '/branding/brainDark.png',
      download: '/branding/downloadassets/logobraindark',
    },
  ]
  const alternateLogoAssets = [
    {
      bg: '/branding/originalBraindao.png',
      download: '/branding/downloadassets/logooriginalbrain',
    },
    {
      bg: '/branding/braindaowhiteNegative.png',
      download: '/branding/downloadassets/logobrainwhitenegative',
    },
    {
      bg: '/branding/braindaoBlackNegative.png',
      download: '/branding/downloadassets/logobrainblacknegative',
    },
  ]
  return (
    <Box bg="tetiaryGray" _dark={{ backgroundColor: 'tetiaryDark' }} pb={20}>
      <Box maxW={{ base: '90%', '2xl': '1280px' }} mx="auto">
        <Flex alignItems="center" flexDir={{ base: 'column', lg: 'row' }}>
          <Box w={{ base: '100%', lg: '60%' }}>
            <Heading
              textAlign={{ base: 'center', lg: 'initial' }}
              color="brand.500"
              fontSize={{ lg: '6xl', base: '3xl' }}
              pt={{ lg: 0, base: 8 }}
            >
              IQ.WIKI Branding kit
            </Heading>
            <Text
              textAlign={{ base: 'center', lg: 'initial' }}
              w={{ lg: '85%', base: '100%', md: '60%' }}
              fontSize={{ lg: '2xl', base: 'md' }}
              mx={{ md: 'auto', lg: '0' }}
            >
              Get easy acess to our brand toolkits and assests for easy usage
              across your site and other marketing purposes.
            </Text>
          </Box>
          <Image
            objectFit="contain"
            imgH={{ base: '320px', lg: '500px' }}
            imgW={{ base: '400px', lg: '500px' }}
            src="/brandingBrain.png"
            alt="Bringing knowledge to the blockchain."
            priority
            mt={10}
          />
        </Flex>

        <Flex mt={{ base: '16', lg: '10' }} mx="auto" justifyContent="center">
          <Text
            position="relative"
            w={{ base: '100%', lg: '60%' }}
            fontSize="2xl"
            textAlign="center"
            lineHeight="1.5"
          >
            <Text
              position="absolute"
              top={{ base: '-5%', lg: '-20%' }}
              left={{ base: '0%', lg: '-5%', md: '-3%' }}
              fontSize={{ lg: '100px', base: '50px' }}
              color="brand.600"
            >
              “
            </Text>
            The branding kit is to help provide proper guidelines for the usage
            of the iq.wiki brand assests so as not to distort the representation
            of IQ.wiki. <br /> <br /> We are honored to be mentioned in your
            content and would love to hear from you for any kind of partnership.
            <Text
              position="absolute"
              bottom={{ base: '-10%', lg: '-20%', md: '-30%' }}
              right={{ base: '5%', lg: '-5%' }}
              fontSize={{ lg: '100px', base: '50px' }}
              color="brand.600"
            >
              ”
            </Text>
          </Text>
        </Flex>

        <Box mt={20}>
          <Flex flexDir="column" gap={5}>
            <Heading
              textAlign={{ base: 'center', lg: 'initial' }}
              fontSize={{ lg: '5xl', base: '3xl' }}
            >
              IQ.WIKI LOGO
            </Heading>
            <Text
              fontSize={{ lg: '2xl', base: 'sm' }}
              textAlign={{ base: 'center', lg: 'initial' }}
            >
              The IQ.Wiki logo was inspired from BrainDAO, a web 3.0 DAO powered
              by the IQ token dedicated to bridging the real-world and the
              metaverse by funding all forms of knowledge on the blockchain.
              Representing IQ and BrainDAO is a logo presented like a brain the
              housepower of all knowledge.
            </Text>
          </Flex>
          <Flex mt={10} flexWrap="wrap" gap="2rem">
            {IQLogoAsset.map((item, index) => {
              return (
                <BrandingAssets
                  key={index}
                  bg={item}
                  currentlyViewed={currentViewedAsset}
                  updateSelectedAsset={() => {
                    setCurrentViewedAsset(item.bg)
                  }}
                />
              )
            })}
          </Flex>
        </Box>

        <Box mt={20}>
          <Flex flexDir="column" gap={5}>
            <Heading textAlign={{ base: 'center', lg: 'initial' }}>
              ALTERNATE LOGO
            </Heading>
          </Flex>
          <Flex mt={10} flexWrap="wrap" gap="2rem">
            {alternateLogoAssets.map((item, index) => {
              return (
                <BrandingAssets
                  key={index}
                  bg={item}
                  currentlyViewed={currentViewedAsset}
                  updateSelectedAsset={() => {
                    setCurrentViewedAsset(item.bg)
                  }}
                />
              )
            })}
          </Flex>
        </Box>

        <Box mt={20}>
          <Flex flexDir="column" gap={5}>
            <Heading fontSize={{ lg: '5xl', base: '3xl' }}>
              ALTERNATE TEXT
            </Heading>
          </Flex>
          <Flex mt={10} flexWrap="wrap" gap="2rem">
            {alternateTextAssets.map((item, index) => {
              return (
                <BrandingAssets
                  key={index}
                  bg={item}
                  currentlyViewed={currentViewedAsset}
                  updateSelectedAsset={() => {
                    setCurrentViewedAsset(item.bg)
                  }}
                />
              )
            })}
          </Flex>
        </Box>

        <Box mt={20}>
          <Flex flexDir="column" gap={5}>
            <Heading fontSize="3xl">Please beware of these things.</Heading>
          </Flex>
          <Flex mt={10}>
            <List spacing={3} display="flex" flexDir="column" gap="16">
              <ListItem>
                <ListIcon as={AiOutlineClose} color="primaryPink" />
                Do not use the IQ.Wiki logo in any way that suggests that we are
                sponsoring, endorsing or affliated to your project in any way.
              </ListItem>
              <ListItem>
                <ListIcon as={AiOutlineClose} color="primaryPink" />
                The IQ wiki brain logo shouldn’t be reperesented with any other
                kind of brain except as stated above.
              </ListItem>
              <ListItem>
                <ListIcon as={AiOutlineClose} color="primaryPink" />
                Do not in any way stretch or manipulate the logo.
              </ListItem>
              {/* You can also use custom icons from react-icons */}
              <ListItem>
                <ListIcon as={AiOutlineClose} color="primaryPink" />
                Do not in any way stretch or manipulate the logo.
              </ListItem>
            </List>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default BrandingPage