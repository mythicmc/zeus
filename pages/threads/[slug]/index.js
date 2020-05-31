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
const fetcher = (url) => fetch(url, {
  headers: { authorization: localStorage.getItem('accessToken') }
}).then(e => e.status === 200 ? e.json() : { status: e.status })

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
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.threads })

  // Fetch the forum as well.
  // TODO: Wait on backend to merge these requests.
  const { data: forum, revalidate: revalidateForum } = useSWR(() => (
    (!slug || !accessToken) ? undefined : ip + `/api/forum/${slug}`
  ), fetcher, { initialData: props.forum })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
    if (authenticated && forum && (forum.status === 403 || forum.status === 401)) revalidateForum()
  }, [authenticated, data, revalidate, forum, revalidateForum])

  return (
    <React.StrictMode>
      <Title
        title={`${forum ? forum.name : 'Forums'} - Mythic`}
        description={forum ? forum.description : 'Loading...'}
        url={`/threads/${slug}`}
      />
      <Layout>
        {Array.isArray(data) && data.length > 0 && data.map(thread => (
          <div key={thread.id}>
            <AnchorLink href='/thread/[id]' as={`/thread/${thread.id}-${titleToSlug(thread.title)}`}>
              <span style={{ color: 'blue' }}>{thread.title}</span>
            </AnchorLink>
            <br />
            <span>Author: {thread.ownerId} | Created On: {new Date(thread.createdOn).toString()}</span>
            <hr />
          </div>
        ))}
        {Array.isArray(data) && data.length === 0 && (
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
  threads: PropTypes.array,
  forum: PropTypes.object,
  slug: PropTypes.string
}

/*
export async function getServerSideProps (context) {
  const slug = context.params.slug // Remove !slug checks from main code.
  const request = await Promise.all([
    fetch(ip + `/api/forum/${slug}/threads`),
    fetch(ip + `/api/forum/${slug}`)
  ])
  // Error handling.
  const response = await Promise.all(request.map(e => e.json()))
  return { props: { threads: response[0], forum: response[1], slug } }
}
*/

export default Threads
