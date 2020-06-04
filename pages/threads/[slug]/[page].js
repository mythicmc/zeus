import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../../imports/title'
import Layout from '../../../imports/layout'
import AnchorLink from '../../../imports/anchorLink'
import useAuthentication from '../../../imports/useAuthentication'
import { ip } from '../../../config.json'

// Helpers.
/**
 * @param {string} title The title of the thread to convert to a slug.
 */
const titleToSlug = title => title.toLowerCase().substring(0, 20).replace(' ', '-')

// TODO: Show the new thread button when perms are available, also SSR.
const Threads = (props) => {
  const router = useRouter()
  const authenticated = useAuthentication()
  const slug = props.slug || router.query.slug

  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    if (!slug) return
    return ip + `/api/forum/${slug}/threads`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.data })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])

  return (
    <React.StrictMode>
      <Title
        title={`${data && data.forum ? data.forum.name : 'Forums'} - Mythic`}
        description={data && data.forum ? data.forum.description : 'Loading...'}
        url={`/threads/${slug}`}
      />
      <Layout auth={authenticated}>
        {data && Array.isArray(data.threads) && data.threads.length > 0 && data.threads.map(thread => (
          <div key={thread.id}>
            <AnchorLink href='/thread/[id]' as={`/thread/${thread.id}-${titleToSlug(thread.title)}`}>
              <span style={{ color: 'blue' }}>{thread.title}</span>
            </AnchorLink>
            <br />
            <span>Author: {thread.authorId} | Created On: {new Date(thread.createdOn).toString()}</span>
            <hr />
          </div>
        ))}
        {data && Array.isArray(data.threads) && data.threads.length === 0 && (
          <>
            <p>Looks like there&apos;s no thread here (yet).</p>
            <AnchorLink href='/threads/[slug]/new' as={`/threads/${slug}/new`}>
              <span style={{ color: 'blue' }}>Create one?</span>
            </AnchorLink>
          </>
        )}
        {!data && <p>Loading...</p>}
        {data && (data.status === 401 || data.status === 403) && <p>You are not logged in!</p>}
        {data && data.status && data.status !== 401 && data.status !== 403 &&
          <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Threads.propTypes = {
  data: PropTypes.object,
  slug: PropTypes.string
}

/*
export async function getServerSideProps (context) {
  const slug = context.params.slug // Remove !slug checks from main code.
  const request = await fetch(ip + `/api/forum/${slug}/threads`)
  // Error handling.
  const response = await request.json()
  return { props: { data: response, slug } }
}
*/

export default Threads
