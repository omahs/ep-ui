import useInfiniteScroll from 'react-infinite-scroll-hook'
import { getUserCreatedWikis } from '@/services/wikis'
import { Center, Text, Spinner, Box } from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { EmptyState } from '@/components/Profile/EmptyState'
import { useInfiniteData } from '@/utils/useInfiniteData'
import { useTranslation } from 'react-i18next'
import { Activity } from '@/types/ActivityDataType'
import Collected from '../Collected'

const UserCreatedWikis = () => {
  const router = useRouter()
  const address = router.query.profile as string
  const { t } = useTranslation()
  const firstTimeFetch = useRef(false)
  const {
    data: wikis,
    fetcher: fetchMoreWikis,
    loading,
    hasMore,
  } = useInfiniteData<Activity>({
    initiator: getUserCreatedWikis,
    arg: { id: address },
  })

  useEffect(() => {
    if (!firstTimeFetch.current) {
      if (address) {
        fetchMoreWikis(true)
        firstTimeFetch.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const [createdWikisSentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: hasMore,
    onLoadMore: () => fetchMoreWikis(),
  })

  return (
    <Box py="10" px={{ base: 6, lg: 0 }}>
      {wikis.length < 1 && !hasMore && (
        <Center>
          <EmptyState
            title="Create your first Wiki"
            body="Start creating your own wiki . When you do, they will appear here!"
          />
        </Center>
      )}
      <Collected wikis={wikis} />
      {loading || hasMore ? (
        <Center mt={8} ref={createdWikisSentryRef} w="full" h="16">
          <Spinner size="xl" />
        </Center>
      ) : (
        !(wikis.length < 1 && !hasMore) && (
          <Center mt="10">
            <Text fontWeight="semibold">{t('seenItAll')}</Text>
          </Center>
        )
      )}
    </Box>
  )
}

export default UserCreatedWikis
