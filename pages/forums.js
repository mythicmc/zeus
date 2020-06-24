import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

// TODO: Show the new forum button when perms are available.
const Forums = (props) => {
  const authenticated = useAuthentication()

  let accessToken
  const { data, revalidate, error } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + '/public/forums'
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.forums })

  useEffect(() => {
    if (authenticated) revalidate()
  }, [authenticated, revalidate])

  return (
    <React.StrictMode>
      <Title
        title='Forums - Mythic'
        description='Forums for the Mythic Minecraft community.'
        url='/forums'
      />
      <Layout auth={authenticated}>
        {Array.isArray(data) && data.map(forum => (
          <div key={forum.slug}>
            <div style={{ display: 'inline-flex', width: '100%' }}>
              <AnchorLink href='/threads/[slug]' as={`/threads/${forum.slug}`}>
                <span style={{ color: 'blue' }}>{forum.name}</span>
              </AnchorLink>
              <div style={{ flex: 1 }} />
              <AnchorLink href='/forum/[slug]/edit' as={`/forum/${forum.slug}/edit`}>
                <span style={{ color: 'blue' }}>Edit</span>
              </AnchorLink>
            </div>
            <br />
            <span>{forum.description}</span>
            <hr />
          </div>
        ))}
        {!data && !error && <p>Loading...</p>}
        {((data && data.status) || error) && <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Forums.propTypes = {
  forums: PropTypes.array
}

export async function getServerSideProps (context) {
  try {
    const request = await fetch(ip + '/public/forums')
    if (!request.ok) return { props: { forums: null } }
    const response = await request.json()
    return { props: { forums: response } }
  } catch (e) {
    console.error(e)
    return { props: { forums: null } }
  }
}

export default Forums
