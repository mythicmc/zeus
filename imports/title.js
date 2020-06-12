import React from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

const Title = ({ title, description, url, noIndex }) => (
  <Head>
    <title>{title}</title>
    <meta property='og:title' content={title} />
    <meta property='og:url' content={url} />
    <meta property='og:description' content={description} />
    <meta name='Description' content={description} />
    {noIndex && <meta name='robots' content='noindex,nofollow' />}
  </Head>
)

Title.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  noIndex: PropTypes.bool
}

export default Title
