import config from '@/config'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { POST_IMG } from '@/services/wikis/queries'
import {
  Wiki,
  EditorContentOverride,
  ValidatorCodes,
  whiteListedDomains,
  EditSpecificMetaIds,
  whiteListedLinkNames,
  CreateNewWikiSlug,
  LinkedWikiKey,
  LinkedWikis,
} from '@everipedia/iq-utils'
import { useAppDispatch } from '@/store/hook'
import { createContext } from '@chakra-ui/react-utils'
import { submitVerifiableSignature } from '@/utils/postSignature'
import {
  useAccount,
  useFeeData,
  useSignTypedData,
  useWaitForTransaction,
} from 'wagmi'
import { NextRouter } from 'next/router'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { getWiki, useGetWikiQuery } from '@/services/wikis'
import {
  getDraftFromLocalStorage,
  removeDraftFromLocalStorage,
} from '@/store/slices/wiki.slice'
import { useToast } from '@chakra-ui/toast'
import { store } from '@/store/store'
import { Dict } from '@chakra-ui/utils'
import { useGetWikiByActivityIdQuery } from '@/services/activities'
import { WikiImageObjectProps } from '@/types/CreateWikiType'
import { logEvent } from './googleAnalytics'
import { getDeadline } from './getDeadline'

export const initialEditorValue = ` `
export const initialMsg =
  'Your Wiki is being processed. It will be available on the blockchain soon.'
export const defaultErrorMessage =
  'Oops, An Error Occurred. Wiki could not be created'
export const successMessage = 'Wiki has been created successfully.'
export const ValidationErrorMessage = (type: string) => {
  switch (type) {
    case ValidatorCodes.CATEGORY:
      return 'Category must be a valid category name.'
    case ValidatorCodes.LANGUAGE:
      return 'Language linked to wiki must be a valid language name.'
    case ValidatorCodes.USER:
      return 'Transaction is not signed by the user.'
    case ValidatorCodes.WORDS:
      return 'Wiki must have at least 100 words.'
    case ValidatorCodes.IMAGE:
      return 'Images must be no more than 5 and no less than 1.'
    case ValidatorCodes.TAG:
      return 'Tags must be no more than 5'
    case ValidatorCodes.URL:
      return 'No External URL are allowed.'
    case ValidatorCodes.METADATA:
      return 'Wiki metadata is incorrect. Please check the wiki.'
    case ValidatorCodes.SUMMARY:
      return 'Summary must be no more than 128 characters.'
    case ValidatorCodes.ID_ERROR:
      return 'ID is incorrect. Please check the wiki.'
    case ValidatorCodes.MEDIA:
      return 'Invalid media data. Please check the media attached to wiki.'
    case ValidatorCodes.GLOBAL_RATE_LIMIT:
      return 'You have reached the rate limit. Please try again later'
    default:
      return 'An error occurred.'
  }
}

export const domain = {
  name: 'EP',
  version: '1',
  chainId: Number(config.chainId),
  verifyingContract: config.wikiContractAddress,
}

export const types = {
  SignedPost: [
    { name: 'ipfs', type: 'string' },
    { name: 'user', type: 'address' },
    { name: 'deadline', type: 'uint256' },
  ],
}

export const MINIMUM_WORDS = 100

export const saveImage = async (image: WikiImageObjectProps) => {
  const formData = new FormData()
  const blob = new Blob([image.type], {
    type: 'image/jpeg', // TODO: find proper type for now its forced to bypass API enforcements
  })

  formData.append('operations', POST_IMG)
  formData.append('map', `{"0": ["variables.file"]}`)
  formData.append('0', blob)
  try {
    const {
      data: {
        data: {
          pinImage: { IpfsHash },
        },
      },
    } = await axios.post(config.graphqlUrl, formData, {})

    return IpfsHash
  } catch (err) {
    return null
  }
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
  const { slug, revision, activeStep, setIsNewCreateWiki, dispatch } =
    useCreateWikiContext()

  useEffect(() => {
    if (activeStep === 3) {
      prevEditedWiki.current.isPublished = true
    }
  }, [activeStep, prevEditedWiki])

  // Reset the State to new wiki if there is no slug
  useEffect(() => {
    if (!slug && !revision) {
      setIsNewCreateWiki(true)
      // fetch draft data from local storage
      const draft = getDraftFromLocalStorage()
      if (draft) {
        dispatch({
          type: 'wiki/setInitialWikiState',
          payload: {
            ...draft,
            content:
              EditorContentOverride + draft.content.replace(/ {2}\n/gm, '\n'),
          },
        })
      } else {
        dispatch({ type: 'wiki/reset' })
        dispatch({
          type: 'wiki/setInitialWikiState',
          payload: {
            content: EditorContentOverride + initialEditorValue,
          },
        })
      }
    } else {
      setIsNewCreateWiki(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, slug])
}

export const useGetSignedHash = () => {
  const {
    setWikiHash,
    wikiHash,
    setMsg,
    setIsLoading,
    setTxHash,
    setActiveStep,
    txHash,
    setCommitMessage,
    dispatch,
  } = useCreateWikiContext()

  const { address: userAddress, isConnected: isUserConnected } = useAccount()
  const deadline = useRef(0)

  const {
    data: signData,
    error: signError,
    isLoading: signing,
    signTypedDataAsync,
  } = useSignTypedData()

  const { refetch } = useWaitForTransaction({ hash: txHash })
  const { data: feeData } = useFeeData({
    formatUnits: 'gwei',
  })
  const gasPrice = useMemo(
    () => parseFloat(feeData?.formatted.gasPrice || '0'),
    [feeData],
  )

  const saveHashInTheBlockchain = async (ipfs: string) => {
    deadline.current = getDeadline()
    setWikiHash(ipfs)
    signTypedDataAsync({
      domain,
      types,
      value: {
        ipfs,
        user: userAddress,
        deadline: deadline.current,
      },
    })
      .then(response => {
        if (response) {
          setActiveStep(1)
        } else {
          setIsLoading('error')
          setMsg(defaultErrorMessage)
        }
      })
      .catch(err => {
        setIsLoading('error')
        setMsg(err.message || defaultErrorMessage)
        logEvent({
          action: 'SUBMIT_WIKI_ERROR',
          label: err.message,
          category: 'wiki_error',
          value: 1,
        })
      })
  }

  const verifyTrxHash = useCallback(
    async () => {
      let timePassed = 0
      const timer = setInterval(() => {
        if (timePassed >= 60 * 1000 && gasPrice > 250) {
          setMsg(`A little congestion on the polygon chain is causing a delay in the 
          creation of your wiki.This would be resolved in a little while.`)
        }
        try {
          const checkTrx = async () => {
            const trx = await refetch()
            if (trx.error || trx.data?.status === 0) {
              setIsLoading('error')
              setMsg(defaultErrorMessage)
              logEvent({
                action: 'SUBMIT_WIKI_ERROR',
                label: 'TRANSACTION_VERIFICATION_ERROR',
                category: 'wiki_error',
                value: 1,
              })
              clearInterval(timer)
            }
            if (
              trx &&
              trx.data &&
              trx.data.status === 1 &&
              trx.data.confirmations > 1
            ) {
              setIsLoading(undefined)
              setActiveStep(3)
              setMsg(successMessage)
              // clear all edit based metadata from redux state
              Object.values(EditSpecificMetaIds).forEach(id => {
                dispatch({
                  type: 'wiki/updateMetadata',
                  payload: {
                    id,
                    value: '',
                  },
                })
              })
              setCommitMessage('')
              removeDraftFromLocalStorage()
              clearInterval(timer)
            }
          }
          checkTrx()
        } catch (err) {
          const errorObject = err as Dict
          setIsLoading('error')
          setMsg(defaultErrorMessage)
          logEvent({
            action: 'SUBMIT_WIKI_ERROR',
            label: errorObject.message,
            category: 'wiki_error',
            value: 1,
          })
          clearInterval(timer)
        }
        timePassed += 3000
      }, 3000)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetch],
  )

  useEffect(() => {
    const getSignedTxHash = async () => {
      if (signData && wikiHash && isUserConnected && userAddress) {
        if (signError) {
          setMsg(defaultErrorMessage)
          setIsLoading('error')
          return
        }
        try {
          const hash = await submitVerifiableSignature(
            signData,
            wikiHash,
            userAddress,
            deadline.current,
          )
          if (hash) {
            setTxHash(hash)
            setActiveStep(2)
          }
        } catch (err) {
          const errorObject = err as Dict
          setIsLoading('error')
          setMsg(errorObject.response.errors[0].extensions.exception.reason)
          logEvent({
            action: 'SUBMIT_WIKI_ERROR',
            label: errorObject.response.errors[0].extensions.exception.reason,
            category: 'wiki_error',
            value: 1,
          })
        }
      }
    }
    getSignedTxHash()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signData, signError])

  return { signing, saveHashInTheBlockchain, verifyTrxHash }
}

export const useCreateWikiState = (router: NextRouter) => {
  const { slug, revision } = router.query

  const { isLoading: isLoadingLatestWiki, data: latestWikiData } =
    useGetWikiQuery(
      typeof revision !== 'string' && typeof slug === 'string'
        ? slug
        : skipToken,
    )

  const { isLoading: isLoadingRevisionWiki, data: revisionWikiData } =
    useGetWikiByActivityIdQuery(
      typeof revision === 'string' ? revision : skipToken,
    )

  const isLoadingWiki = isLoadingLatestWiki || isLoadingRevisionWiki

  const wikiData = useMemo(() => {
    const data = revisionWikiData || latestWikiData

    if (data?.linkedWikis) {
      // remove null values from linked wikis
      const newLinkedWikis = {} as LinkedWikis
      Object.entries(data.linkedWikis).forEach(([key, value]) => {
        if (value !== null) {
          newLinkedWikis[key as LinkedWikiKey] = value
        }
      })
      return {
        ...data,
        linkedWikis: newLinkedWikis,
      }
    }

    return data
  }, [latestWikiData, revisionWikiData])

  const [commitMessage, setCommitMessage] = useState('')
  const [openTxDetailsDialog, setOpenTxDetailsDialog] = useState<boolean>(false)
  const [isWritingCommitMsg, setIsWritingCommitMsg] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>()
  const [submittingWiki, setSubmittingWiki] = useState(false)
  const [wikiHash, setWikiHash] = useState<string>()
  const [isNewCreateWiki, setIsNewCreateWiki] = useState<boolean>(false)
  const toast = useToast()
  const [openOverrideExistingWikiDialog, setOpenOverrideExistingWikiDialog] =
    useState<boolean>(false)
  const [existingWikiData, setExistingWikiData] = useState<Wiki>()
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
    commitMessage,
    setCommitMessage,
    dispatch,
    slug,
    revision,
    toast,
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
    openOverrideExistingWikiDialog,
    setOpenOverrideExistingWikiDialog,
    existingWikiData,
    setExistingWikiData,
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

export const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}

export const isVerifiedContentLinks = (content: string) => {
  const markdownLinks = content.match(/\[(.*?)\]\((.*?)\)/g)
  let isValid = true
  markdownLinks?.every(link => {
    const linkMatch = link.match(/\[(.*?)\]\((.*?)\)/)
    const text = linkMatch?.[1]
    const url = linkMatch?.[2]

    if (
      text &&
      url &&
      whiteListedLinkNames.includes(text) &&
      !isValidUrl(url)
    ) {
      isValid = true
      return true
    }

    if (url && url.charAt(0) !== '#') {
      const validURLRecognizer = new RegExp(
        `^https?://(www\\.)?(${whiteListedDomains.join('|')})`,
      )
      isValid = validURLRecognizer.test(url)
      return isValid
    }
    return true
  })
  return isValid
}

export const isWikiExists = async (
  slug: string,
  setExistingWikiData: (data: Wiki) => void,
) => {
  if (slug === CreateNewWikiSlug) return false
  const { data, isError } = await store.dispatch(getWiki.initiate(slug))
  if (isError) return false
  if (data) {
    setExistingWikiData(data)
    return true
  }
  return false
}
