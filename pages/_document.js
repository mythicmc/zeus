import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'

const icon = '/static/widgets.png'

class MyDocument extends Document {
  render () {
    return (
      <html lang='en' dir='ltr'>
        <Head>
          <link rel='icon' href={icon} />
          <meta charSet='utf-8' />
          {/* Use minimum-scale=1 to enable GPU rasterization */}
          <meta
            name='viewport'
            content='user-scalable=0, initial-scale=1,
            minimum-scale=1, width=device-width, height=device-height'
          />
          {/* PWA primary color */}
          <meta name='theme-color' content='#fff' />
          {/* Open Graph Protocol support. */}
          <meta property='og:type' content='website' />
          <meta property='og:image' content={icon} /> {/* TODO: Need to check. */}
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

export default MyDocument
