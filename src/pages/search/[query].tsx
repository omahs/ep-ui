import React, { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import {
  Avatar,
  Box,
  chakra,
  Flex,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { fetchCategoriesList, fetchWikisList } from '@/services/search/utils'
import { SearchSkeleton } from '@/components/Search/SearchSkeleton'
import { Category } from '@/services/search'
import ActivityCard from '@/components/Activity/ActivityCard'
import { WikiPreview } from '@everipedia/iq-utils'
import { Link } from '@/components/Elements'

interface SearchQueryProps {
  query: string
}

const SearchQuery = ({ query }: SearchQueryProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    wikis: WikiPreview[]
    categories: Category[]
  }>({
    wikis: [],
    categories: [],
  })
  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchWikisList(query), fetchCategoriesList(query)]).then(
      res => {
        const [wikis = [], categories = []] = res
        if (wikis.length || categories.length) {
          setResults({ wikis, categories })
          setIsLoading(false)
        }
      },
    )
  }, [query])
  const { wikis, categories } = results
  const totalResults = wikis.length + categories.length

  const wikiList = wikis.map(wiki => {
    return (
      <ActivityCard
        key={wiki.id}
        title={wiki.title}
        brief={wiki.summary}
        editor={wiki.user}
        wikiId={wiki.id}
        lastModTimeStamp={wiki.updated}
        WikiImgObj={wiki.images}
        activityId={wiki.id}
        categories={wiki.categories}
        tags={wiki.tags}
      />
    )
  })
  const categoryList = categories.map(category => {
    return (
      <Link href={`/categories/${category.id}`}>
        <Flex
          key={category.id}
          bgColor="cardBg"
          justifyContent="flex-start"
          borderWidth="1px"
          borderColor="cardBorder"
          borderRadius="lg"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.10)"
          px={{ base: 3, lg: 5 }}
          py={{ base: 3, lg: 3 }}
          w="full"
          cursor="pointer"
        >
          <Avatar
            src={category.cardImage}
            name={category.title}
            boxSize="16"
            sx={{ img: { rounded: 'none' } }}
          />
          <chakra.span fontWeight="semibold" fontSize="sm" ml="4">
            {category.title}
          </chakra.span>
        </Flex>
      </Link>
    )
  })

  return (
    <Box bgColor="pageBg" my={-8} py={8}>
      <NextSeo
        title={`Results for ${query}`}
        openGraph={{
          title: `Results for ${query}`,
          description: `Showing ${totalResults} Wikis with ${query} query`,
        }}
      />
      <Box w="min(90%, 1100px)" mx="auto" my={{ base: '10', lg: '16' }}>
        <Heading mt={8} mb={4} as="h1" size="2xl" letterSpacing="wide">
          Results for {query}
        </Heading>

        {!isLoading && wikis.length !== 0 && (
          <Stack spacing="4">
            <Text>Showing {totalResults} results </Text>

            <Heading fontSize="2xl">Wikis</Heading>
            <Flex direction="column" gap="4">
              {wikiList}
            </Flex>
            {categories.length !== 0 && (
              <>
                <Heading fontSize="2xl">Categories</Heading>
                <Flex direction="column" gap="4">
                  {categoryList}
                </Flex>
              </>
            )}
          </Stack>
        )}
        {isLoading && <SearchSkeleton />}
      </Box>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const queryParam = context.params?.query
  const query = queryParam as string

  return {
    props: { query },
  }
}

export default SearchQuery
