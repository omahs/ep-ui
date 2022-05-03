import config from '@/config'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { POST_IMG } from '@/services/wikis/queries'
import {
  Image,
  Wiki,
  CommonMetaIds,
  EditSpecificMetaIds,
  WikiRootBlocks,
  MData,
} from '@/types/Wiki'
import diff from 'fast-diff'
import { getWordCount } from '@/utils/getWordCount'
import { getWikiMetadataById } from '@/utils/getWikiFields'
import { useAppDispatch } from '@/store/hook'
import { createContext } from '@chakra-ui/react-utils'
import { submitVerifiableSignature } from '@/utils/postSignature'
import { useAccount, useSignTypedData, useWaitForTransaction } from 'wagmi'
import { NextRouter } from 'next/router'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useGetWikiQuery } from '@/services/wikis'
import { PageTemplate } from '@/data/pageTemplate'

export const initialEditorValue = ` `
export const initialMsg =
  'Your Wiki is being processed. It will be available on the blockchain soon.'
export const errorMessage = 'Oops, An Error Occurred. Wiki could not be created'
export const successMessage = 'Wiki has been created successfully.'

export const domain = {
  name: 'EP',
  version: '1',
  chainId: config.chainId,
  verifyingContract: config.wikiContractAddress,
}

export const types = {
  SignedPost: [
    { name: 'ipfs', type: 'string' },
    { name: 'user', type: 'address' },
    { name: 'deadline', type: 'uint256' },
  ],
}

export const MINIMUM_WORDS = 150

export const saveImage = async (image: Image) => {
  const formData = new FormData()
  const blob = new Blob([image.type], {
    type: 'multipart/form-data',
  })

  formData.append('operations', POST_IMG)
  const map = `{"0": ["variables.file"]}`
  formData.append('map', map)
  formData.append('0', blob)

  const {
    data: {
      data: {
        pinImage: { IpfsHash },
      },
    },
  } = await axios.post(config.graphqlUrl, formData, {})

  return IpfsHash
}

export const [CreateWikiProvider, useCreateWikiContext] =
  createContext<ReturnType<typeof useCreateWikiState>>()

export const useCreateWikiEffects = (
  wiki: Wiki,
  prevEditedWiki: React.MutableRefObject<{
    wiki?: Wiki | undefined
    isPublished: boolean
  }>,
) => {
  const {
    slug,
    md,
    wikiData,
    activeStep,
    setIsNewCreateWiki,
    setMd,
    dispatch,
    isLoadingWiki,
  } = useCreateWikiContext()

  useEffect(() => {
    if (activeStep === 3) {
      prevEditedWiki.current.isPublished = true
    }
  }, [activeStep])

  // Reset the State to new wiki if there is no slug
  useEffect(() => {
    if (!slug) {
      setIsNewCreateWiki(true)
      dispatch({ type: 'wiki/reset' })
      setMd(initialEditorValue)
    } else {
      setIsNewCreateWiki(false)
    }
  }, [dispatch, slug])

  useEffect(() => {
    if (isLoadingWiki === false && !wikiData) setMd(initialEditorValue)
  }, [isLoadingWiki, wikiData])

  const updatePageTypeTemplate = useCallback(() => {
    const meta = [
      getWikiMetadataById(wiki, CommonMetaIds.PAGE_TYPE),
      getWikiMetadataById(wiki, CommonMetaIds.TWITTER_PROFILE),
    ]
    const pageType = PageTemplate.find(p => p.type === meta[0]?.value)

    setMd(String(pageType?.templateText))
  }, [wiki])

  // update the page type template when the page type changes
  const presentPageType = useMemo(
    () =>
      wiki?.metadata?.find((m: MData) => m.id === CommonMetaIds.PAGE_TYPE)
        ?.value,
    [wiki?.metadata],
  )
  useEffect(() => {
    if (presentPageType) {
      let isMdPageTemplate = false
      PageTemplate.forEach(p => {
        if (p.templateText === md) isMdPageTemplate = true
      })
      if (isMdPageTemplate || md === ' ') updatePageTypeTemplate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentPageType])
}

export const useGetSignedHash = (deadline: number) => {
  const {
    setWikiHash,
    wikiHash,
    setMsg,
    setIsLoading,
    setTxHash,
    setActiveStep,
  } = useCreateWikiContext()
  const [{ data: accountData }] = useAccount()
  const [{ data, error, loading: signing }, signTypedData] = useSignTypedData(
    {},
  )
  const [, wait] = useWaitForTransaction()

  const saveHashInTheBlockchain = async (ipfs: string) => {
    setWikiHash(ipfs)
    signTypedData({
      domain,
      types,
      value: {
        ipfs,
        user: accountData?.address || '',
        deadline,
      },
    }).then(response => {
      if (response.data) {
        setActiveStep(1)
      }
      if (response.error) {
        setIsLoading('error')
        setMsg(errorMessage)
      }
    })
  }

  const verifyTrxHash = useCallback(
    async (trxHash: string) => {
      const timer = setInterval(() => {
        try {
          const checkTrx = async () => {
            const trx = await wait({
              hash: trxHash,
            })
            if (trx.error) {
              setIsLoading('error')
              setMsg(errorMessage)
              clearInterval(timer)
            } else if (trx.data.confirmations > 1) {
              setIsLoading(undefined)
              setActiveStep(3)
              setMsg(successMessage)
              clearInterval(timer)
            }
          }
          checkTrx()
        } catch (err) {
          setIsLoading('error')
          setMsg(errorMessage)
          clearInterval(timer)
        }
      }, 3000)
    },
    [wait],
  )

  useEffect(() => {
    const getSignedTxHash = async () => {
      if (data && wikiHash && accountData) {
        if (error) {
          setMsg(errorMessage)
          setIsLoading('error')
          return
        }
        try {
          const { data: relayerData }: any = await submitVerifiableSignature(
            data,
            wikiHash,
            accountData?.address,
            deadline,
          )

          if (relayerData && relayerData.hash) {
            setTxHash(relayerData.hash)
            setActiveStep(2)
          }
        } catch (err) {
          setIsLoading('error')
          setMsg(errorMessage)
        }
      }
    }
    getSignedTxHash()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error])

  return { signing, saveHashInTheBlockchain, verifyTrxHash }
}

export const useCreateWikiState = (router: NextRouter) => {
  const { isLoading: isLoadingWiki, data: wikiData } = useGetWikiQuery(
    typeof router.query.slug === 'string' ? router.query.slug : skipToken,
    {
      skip: router.isFallback,
    },
  )
  const { slug } = router.query
  const [md, setMd] = useState<string>()
  const [openTxDetailsDialog, setOpenTxDetailsDialog] = useState<boolean>(false)
  const [isWritingCommitMsg, setIsWritingCommitMsg] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>()
  const [submittingWiki, setSubmittingWiki] = useState(false)
  const [wikiHash, setWikiHash] = useState<string>()
  const [isNewCreateWiki, setIsNewCreateWiki] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [loadingState, setIsLoading] = useState<
    'error' | 'loading' | undefined
  >('loading')
  const [wikiId, setWikiId] = useState<string>('')
  const [msg, setMsg] = useState<string>(initialMsg)
  const [txError, setTxError] = useState({
    title: '',
    description: '',
    opened: false,
  })
  const dispatch = useAppDispatch()

  return {
    isLoadingWiki,
    wikiData,
    dispatch,
    slug,
    md,
    setMd,
    openTxDetailsDialog,
    setOpenTxDetailsDialog,
    isWritingCommitMsg,
    setIsWritingCommitMsg,
    txHash,
    setTxHash,
    submittingWiki,
    setSubmittingWiki,
    wikiHash,
    setWikiHash,
    isNewCreateWiki,
    setIsNewCreateWiki,
    activeStep,
    setActiveStep,
    loadingState,
    setIsLoading,
    wikiId,
    setWikiId,
    msg,
    setMsg,
    txError,
    setTxError,
  }
}

export const calculateEditInfo = (
  prevWiki: Wiki,
  currWiki: Wiki,
  dispatch: ReturnType<typeof useAppDispatch>,
) => {
  const calculateContentChanged = () => {
    // check if content has changed
    const prevContent = prevWiki?.content
    const currContent = currWiki?.content

    // calculate percent changed and number of words changed in prevContent and currContent
    let contentAdded = 0
    let contentRemoved = 0
    let contentUnchanged = 0

    let wordsAdded = 0
    let wordsRemoved = 0

    diff(prevContent, currContent).forEach(part => {
      if (part[0] === 1) {
        contentAdded += part[1].length
        wordsAdded += getWordCount(part[1])
      }
      if (part[0] === -1) {
        contentRemoved += part[1].length
        wordsRemoved += getWordCount(part[1])
      }
      if (part[0] === 0) {
        contentUnchanged += part[1].length
      }
    })

    const percentChanged =
      ((contentAdded + contentRemoved) / contentUnchanged) * 100
    const wordsChanged = wordsAdded + wordsRemoved

    // update metadata in redux state
    dispatch({
      type: 'wiki/updateMetadata',
      payload: {
        id: EditSpecificMetaIds.WORDS_CHANGED,
        value: wordsChanged.toString(),
      },
    })

    dispatch({
      type: 'wiki/updateMetadata',
      payload: {
        id: EditSpecificMetaIds.PERCENT_CHANGED,
        value: percentChanged.toFixed(2),
      },
    })
  }

  // calculate which blocks have changed
  const blocksChanged = []

  // root level block changes
  if (prevWiki.content !== currWiki.content) {
    blocksChanged.push(WikiRootBlocks.CONTENT)
    calculateContentChanged()
  }
  if (prevWiki.title !== currWiki.title)
    blocksChanged.push(WikiRootBlocks.TITLE)
  if (prevWiki.categories !== currWiki.categories)
    blocksChanged.push('categories')
  if (prevWiki.tags !== currWiki.tags) blocksChanged.push(WikiRootBlocks.TAGS)
  if (prevWiki.summary !== currWiki.summary)
    blocksChanged.push(WikiRootBlocks.SUMMARY)
  const prevImgId = prevWiki.images && prevWiki.images[0].id
  const currImgId = currWiki.images && currWiki.images[0].id
  if (prevImgId !== currImgId) blocksChanged.push(WikiRootBlocks.WIKI_IMAGE)

  // common metadata changes
  Object.values(CommonMetaIds).forEach(id => {
    if (
      getWikiMetadataById(prevWiki, id)?.value !==
      getWikiMetadataById(currWiki, id)?.value
    )
      blocksChanged.push(id)
  })

  // update blocks changed metadata in redux state
  dispatch({
    type: 'wiki/updateMetadata',
    payload: {
      id: EditSpecificMetaIds.BLOCKS_CHANGED,
      value: blocksChanged.join(','),
    },
  })
}