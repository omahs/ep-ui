import React from 'react'
import { Heading, VStack, Text, SimpleGrid } from '@chakra-ui/react'
import { MdOutlinePeopleAlt, MdOutlinePublic } from 'react-icons/md'
import { useTranslation } from 'react-i18next'
import AboutFeaturesCard from './AboutFeaturesCard'
import IQgreyLogo from './logos/iq.svg'

const AboutFeatures = () => {
  const { t } = useTranslation()
  return (
    <VStack
      spacing={8}
      maxW={{ base: '100%', xl: '90%', '2xl': '1280px' }}
      mx="auto"
      mt="24"
    >
      <Heading
        fontWeight="bold"
        lineHeight="shorter"
        textAlign="center"
        size="lg"
      >{`${t('aboutFeatHeading')}`}</Heading>
      <Text
        align={{ base: 'left', lg: 'center' }}
        maxW="3xl"
        textAlign="center"
        fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
        mb={4}
      >
        {`${t('aboutFeatContent')}`}
      </Text>
      <SimpleGrid columns={[1, 1, 2, 2, 3]} spacing={4} mt={4}>
        <AboutFeaturesCard
          title={`${t('abtFeatOneHeading')}`}
          content={`${t('abtFeatOneContent')}`}
          icon={MdOutlinePublic}
        />
        <AboutFeaturesCard
          title={`${t('abtFeatTwoHeading')}`}
          content={`${t('abtFeatTwoContent')}`}
          icon={IQgreyLogo}
        />
        <AboutFeaturesCard
          title={`${t('abtFeatThreeHeading')}`}
          content={`${t('abtFeatThreeContent')}`}
          icon={MdOutlinePeopleAlt}
        />
      </SimpleGrid>
    </VStack>
  )
}

export default AboutFeatures
