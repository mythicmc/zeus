import React from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
// import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

// TODO: Show the new forum button when perms are available, also SSR.
const Forums = (props) => {
  // const authenticated = useAuthentication()

  let accessToken
  const { data } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + '/api/forums'
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.forums })

  /*
  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])
  */

  return (
    <React.StrictMode>
      <Title
        title='Forums - Mythic'
        description='Forums for the Mythic Minecraft community.'
        url='/forums'
      />
      <Layout>
        {Array.isArray(data) && data.map(forum => (
          <div key={forum.slug}>
            <AnchorLink href='/threads/[slug]' as={`/threads/${forum.slug}`}>
              <span style={{ color: 'blue' }}>{forum.name}</span>
            </AnchorLink>
            <br />
            <span>{forum.description}</span>
            <hr />
          </div>
        ))}
        {!data && <p>Loading...</p>}
        {data && (data.status === 401 || data.status === 403) && <p>You are not logged in!</p>}
        {data && data.status && data.status !== 401 && data.status !== 403 &&
          <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Forums.propTypes = {
  forums: PropTypes.array
}

/*
export async function getServerSideProps (context) {
  const request = await fetch(ip + '/api/forums')
  // Error handling.
  const response = await request.json()
  return { props: { forums: response } }
}
*/

export default Forums
