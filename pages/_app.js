import React from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

function MyApp ({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Use minimum-scale=1 to enable GPU rasterization */}
        <meta
          name='viewport'
          content='user-scalable=0, initial-scale=1,
            minimum-scale=1, width=device-width, height=device-height'
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

MyApp.propTypes = {
  pageProps: PropTypes.object.isRequired,
  Component: PropTypes.elementType.isRequired
}

export default MyApp
