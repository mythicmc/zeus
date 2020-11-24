import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

const icon = '/assets/icon.png'

class MyDocument extends Document {
  render () {
    return (
      <Html lang='en' dir='ltr'>
        <Head>
          <link rel='icon' href={icon} />
          <meta charSet='utf-8' />
          {/* PWA primary color */}
          <meta name='theme-color' content='#34644c' />
          {/* Open Graph Protocol support. */}
          <meta property='og:type' content='website' />
          <meta property='og:image' content={icon} />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
