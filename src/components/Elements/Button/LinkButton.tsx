import React from 'react'
import Link, { LinkProps } from 'next/link'
import { Button, ButtonProps } from '@chakra-ui/react'

type ChakraAndNextProps = ButtonProps & LinkProps

const LinkButton = ({ href, children, ...props }: ChakraAndNextProps) => {
  let linkProps = {}
  if (String(href).includes('create-wiki') || String(href).includes('about')) {
    linkProps = {
      prefetch: false,
    }
  }
  return (
    <Link href={href} passHref {...{ linkProps }}>
      <Button as="a" {...props}>
        {children}
      </Button>
    </Link>
  )
}

export default LinkButton