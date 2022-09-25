import React, { useEffect, useState } from 'react'
import { Box, Flex, VStack } from '@chakra-ui/react'
import { CommonMetaIds, EditSpecificMetaIds, Wiki } from '@/types/Wiki'
import { getWikiImageUrl } from '@/utils/getWikiImageUrl'
import { TokenStats } from '@/services/token-stats'
import { fetchTokenStats, getTokenFromURI } from '@/services/token-stats/utils'
import { useStickyBox } from 'react-sticky-box'
import { WikiDetails } from './InsightComponents/WikiDetails'
import { RelatedWikis } from './InsightComponents/RelatedWikis'
import ProfileStatistics from './InsightComponents/ProfileStatistics'
import ProfileSummary from './InsightComponents/ProfileSummary'
import TwitterTimeline from './InsightComponents/TwitterTimeline'
import RelatedMediaGrid from './InsightComponents/RelatedMedia'
import CurrencyConverter from './InsightComponents/CurrencyConverter'
import WikiCommitMessage from './InsightComponents/WikiCommitMessage'

interface WikiInsightsProps {
  wiki: Wiki
  relatedWikis: Wiki[] | null
  ipfs?: string
  dateTime?: string | undefined
}

const WikiInsights = ({
  wiki,
  relatedWikis,
  ipfs,
  dateTime,
}: WikiInsightsProps) => {
  const stickyRef = useStickyBox({ offsetTop: 100, offsetBottom: 20 })
  const coingeckoLink = wiki.metadata.find(
    meta => meta.id === CommonMetaIds.COINGECKO_PROFILE,
  )?.value

  const twitterLink = wiki.metadata.find(
    meta => meta.id === CommonMetaIds.TWITTER_PROFILE,
  )?.value

  const commitMessage = wiki.metadata.find(
    meta => meta.id === EditSpecificMetaIds.COMMIT_MESSAGE,
  )?.value

  const [tokenStats, setTokenStats] = useState<TokenStats>()
  useEffect(() => {
    const fetchTokenData = async () => {
      await fetchTokenStats(coingeckoLink).then(res => {
        setTokenStats(res)
      })
    }
    fetchTokenData()
  }, [coingeckoLink])

  return (
    <VStack
      borderLeftWidth={{ base: 0, xl: '1px' }}
      p={{ base: 0, xl: 4 }}
      pt={{ xl: '24', base: '10' }}
    >
      <Box as="aside" ref={stickyRef} w="100%">
        <VStack
          w={{ base: '90%', md: '100%', xl: 'clamp(300px, 25vw, 430px)' }}
          mx={{ base: 'auto', xl: 0 }}
          px={{ base: '0', md: '4', xl: '0' }}
          spacing={4}
        >
          <WikiDetails
            wikiTitle={wiki}
            categories={wiki.categories}
            createdTime={wiki?.created}
            ipfsHash={ipfs || wiki.ipfs}
            txHash={wiki.transactionHash}
            createdBy={wiki.author}
            imgSrc={getWikiImageUrl(wiki)}
          />
          <ProfileSummary wiki={wiki} />
          {!!coingeckoLink && (
            <>
              <ProfileStatistics tokenStats={tokenStats} />
              {tokenStats && (
                <CurrencyConverter
                  token={getTokenFromURI(coingeckoLink)}
                  tokenStats={tokenStats}
                />
              )}
            </>
          )}
          <WikiCommitMessage
            commitMessage={commitMessage}
            user={wiki.user}
            lastUpdated={wiki.updated || dateTime}
          />

          <Flex
            w="100%"
            display={{ base: 'none', xl: 'block', md: 'none' }}
            gap={6}
          >
            {!!twitterLink && <TwitterTimeline url={twitterLink} />}
            {wiki.categories.length !== 0 && (
              <RelatedWikis relatedWikis={relatedWikis} />
            )}
            {wiki.media && wiki.media.length > 0 && (
              <RelatedMediaGrid media={wiki.media} />
            )}
          </Flex>
        </VStack>
      </Box>
    </VStack>
  )
}

export default WikiInsights
