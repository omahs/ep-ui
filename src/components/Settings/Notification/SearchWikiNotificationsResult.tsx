import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SearchSkeleton } from '@/components/Search/SearchSkeleton'
import { fetchWikisList } from '@/services/search/utils'
import { WikiPreview } from '@everipedia/iq-utils'
import { Flex, Box } from '@chakra-ui/react'
import NotificationCard from '@/components/Notification/NotificationCard'

const SearchWikiNotificationsResult = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [results, setResults] = useState<{
    articles: WikiPreview[]
  }>({
    articles: [],
  })
  const route = useRouter()
  const q = route.query?.q as string

  useEffect(() => {
    if (q.length >= 3) {
      setIsLoading(true)
      Promise.all([fetchWikisList(q)]).then(res => {
        const [articles = []] = res
        if (articles.length) {
          setResults({ articles })
          setIsLoading(false)
        }
      })
    }
  }, [q])

  const { articles } = results

  const articleList = articles.map(article => {
    return (
      <NotificationCard
        key={article.id}
        title={article.title}
        brief={article.summary}
        editor={article.user}
        wikiId={article.id}
        lastModTimeStamp={article.updated}
        WikiImgObj={article.images}
        categories={article.categories}
        tags={article.tags}
      />
    )
  })

  return (
    <>
      {!isLoading && articles.length !== 0 && (
        <Box>
          <Flex direction="column" gap="4">
            {articleList}
          </Flex>
        </Box>
      )}
      {isLoading && <SearchSkeleton />}
    </>
  )
}

export default SearchWikiNotificationsResult
