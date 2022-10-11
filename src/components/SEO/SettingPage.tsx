import { NextSeo } from 'next-seo'
import React from 'react'

const SettingsPageHeader = () => (
  <NextSeo
    title="Settings"
    description="Update your profile and notification settings"
    canonical="https://iq.wiki/account/settings"
    openGraph={{
      title: 'Settings',
      description: 'Update your profile and notification settings',
      type: 'website',
      site_name: 'IQ.Wiki',
      images: [
        {
          url: 'https://iq.wiki/android-chrome-512x512.png',
          width: 512,
          height: 512,
          alt: 'IQ.Wiki | Crypto Encyclopedia',
        },
      ],
    }}
    twitter={{
      cardType: 'summary_large_image',
      handle: '@Everipedia',
      site: 'Everipedia',
    }}
  />
)

export default SettingsPageHeader