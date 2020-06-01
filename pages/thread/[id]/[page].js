import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../../imports/title'
import Layout from '../../../imports/layout'
import useAuthentication from '../../../imports/useAuthentication'
import { ip } from '../../../config.json'

// Helpers.
/**
 * @param {string} title The title of the thread to convert to a slug.
 */
const titleToSlug = title => title.toLowerCase().substring(0, 20).replace(' ', '-')

// TODO: /page-number, BBCode parsing and SSR.
const Thread = (props) => {
  const router = useRouter()
  const authenticated = useAuthentication()
  const id = props.id || router.query.id

  const [fetching, setFetching] = useState(false)
  const [statusCode, setStatusCode] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    if (!id) return
    return ip + `/api/thread/${id.split('-')[0]}`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.data })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])

  // Validate the slug in the URL.
  useEffect(() => {
    if (id && data && data.thread && data.thread.title) {
      const title = id.split('-').slice(1).join('-')
      if (title !== titleToSlug(data.thread.title)) {
        router.push(router.route, router.asPath.replace(title, titleToSlug(data.thread.title)))
      }
    }
  }, [data, id, router])

  const handleReply = async () => {
    if (!replyContent) return
    try {
      setFetching(true)
      const authorization = localStorage.getItem('accessToken')
      const request = await fetch(ip + '/api/post/' + data.thread.id, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify({ content: replyContent })
      })
      if (request.status === 200) {
        setReplyContent('')
        await revalidate() // TODO
      } else setStatusCode(request.status)
    } catch (e) {
      setStatusCode(null)
      console.error(e)
    }
    setFetching(false)
  }

  return (
    <React.StrictMode>
      <Title
        title={`${data && data.thread ? data.thread.title : 'Thread'} - Mythic`}
        description={data && data.posts ? data.posts[0].content.substring(0, 100) + '...' : 'Loading...'}
        url={`/thread/${id}`}
      />
      <Layout>
        {data && data.thread && <h2>{data.thread.title}</h2>}
        {data && Array.isArray(data.posts) && (
          <>
            <hr />
            {data.posts.map((post, index) => (
              <div key={post.id}>
                <a href={`#post-${post.id}`} id={`post-${post.id}`}>Post #{index + 1}</a>
                <br /><br />
                <span>Author: {post.authorId} | Created On: {new Date(post.createdOn).toString()}</span>
                <p>{post.content}</p>
                <hr />
              </div>
            ))}
            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} />
            <button onClick={handleReply}>Reply</button>
            {fetching && <p>Replying...</p>}
            {(statusCode === 403 || statusCode === 401)
              ? <p>You cannot reply to this thread!</p>
              : statusCode !== null && <p>An unknown error occurred.</p>}
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

Thread.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string
}

/*
export async function getServerSideProps (context) {
  const id = context.params.id // Remove !id checks from main code.
  const request = await fetch(ip + `/api/thread/${id}`)
  // Error handling.
  const response = await request.json()
  return { props: { data: response, id } }
}
*/

export default Thread
