import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import useSWR from 'swr'
import unified from 'unified'
import gfm from 'remark-gfm'
import parse from 'remark-parse'
import remark2react from 'remark-react'
import Title from '../../../imports/title'
import Layout from '../../../imports/layout'
import useAuthentication from '../../../imports/useAuthentication'
import { ip } from '../../../config.json'

// Helpers.
/**
 * @param {string} title The title of the thread to convert to a slug.
 */
const titleToSlug = title => title.toLowerCase().substring(0, 20).replace(' ', '-')
const MarkdownImage = (props) => {
  const obj = {}
  if (/=(\d+x\d*|\d*x\d+)$/.test(props.src)) {
    const split = props.src.split('=')
    const size = split.pop().split('x')
    obj.src = split.join('=')
    if (size[0] && !isNaN(+size[0])) obj.height = +size[0]
    if (size[1] && !isNaN(+size[1])) obj.width = +size[1]
  }
  return <img {...props} {...obj} />
}
MarkdownImage.propTypes = { src: PropTypes.string.isRequired }

// TODO: /page-number and rich text editor.
const Thread = (props) => {
  const router = useRouter()
  const authenticated = useAuthentication()
  const id = props.id || router.query.id

  const [fetching, setFetching] = useState(false)
  const [statusCode, setStatusCode] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  let accessToken
  const { data, revalidate, error } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + `/public/thread/${id.split('-')[0]}`
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

  const handleLike = async (postId, like) => {
    try {
      setFetching(true)
      const authorization = localStorage.getItem('accessToken')
      const request = await fetch(ip + '/api/post/' + postId + (like === 'dislike' ? '/dislike' : '/like'), {
        method: like ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json', authorization }
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
      <Layout auth={authenticated}>
        {data && data.thread && <h2>{data.thread.title}</h2>}
        {data && Array.isArray(data.posts) && (
          <>
            <hr />
            {data.posts.sort((a, b) => a.createdOn - b.createdOn).map((post, index) => {
              // Retain compatibility with both Gaia and Hera.
              const likes = (Array.isArray(post.likes) ? post.likes.length : post.likes) || 0
              const liked = (authenticated && post.likes && post.likes.includes(authenticated.name)) ||
              post.liked === 1
              const dislikes = (Array.isArray(post.dislikes) ? post.dislikes.length : post.dislikes) || 0
              const disliked = (authenticated && post.dislikes && post.dislikes.includes(authenticated.name)) ||
              post.liked === -1

              const markdown = unified().use(parse).use(gfm).use(remark2react, {
                remarkReactComponents: { img: MarkdownImage }
              }).processSync(post.content).result

              return (
                <div key={post.id}>
                  <a href={`#post-${post.id}`} id={`post-${post.id}`}>Post #{index + 1}</a>
                  <br /><br />
                  <span>Author: {post.authorId} | Created On: {new Date(post.createdOn).toString()}</span>
                  <br />
                  <span>Likes: {likes} | Dislikes: {dislikes}</span>
                  <div>{markdown}</div>
                  {authenticated && (
                    <>
                      <button onClick={() => handleLike(post.id, !liked)}>
                        {liked ? 'Remove Like' : 'Like'}
                      </button> |&#160;
                      <button onClick={() => handleLike(post.id, !disliked && 'dislike')}>
                        {disliked ? 'Remove Dislike' : 'Dislike'}
                      </button>
                    </>
                  )}
                  {!!post.lastEdit && (
                    <div style={{ marginTop: 8, marginBottom: 8, padding: 2, border: '2px solid black' }}>
                      Edited on {new Date(post.lastEdit).toString()}{
                        post.editorId === post.authorId && ' by ' + post.editorId
                      } | Reason: {post.editReason}
                    </div>
                  )}
                  <hr />
                </div>
              )
            })}
            {authenticated && (
              <>
                {/* TODO: Rich text editor. */}
                <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                <button onClick={handleReply}>Reply</button>
              </>
            )}
            {fetching && <p>Replying...</p>}
            {(statusCode === 403 || statusCode === 401)
              ? <p>You cannot reply to this thread!</p>
              : statusCode !== null && <p>An unknown error occurred.</p>}
          </>
        )}
        {(!data && !error && <p>Loading...</p>) ||
        (data && (data.status === 401 || data.status === 403) && <p>You are not logged in!</p>) ||
        (data && data.status === 404 && <p>This thread does not exist!</p>) ||
        (((data && data.status) || error) && <p>An unknown error occurred.</p>)}
      </Layout>
    </React.StrictMode>
  )
}

Thread.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string
}

export async function getServerSideProps (context) {
  const id = context.params.id
  try {
    const request = await fetch(ip + `/public/thread/${id.split('-')[0]}`)
    if (request.status === 404) {
      context.res.statusCode = 404
      return { props: { data: { status: 404 }, id } }
    } else if (!request.ok) return { props: { data: null, id } }
    const response = await request.json()
    return { props: { data: response, id } }
  } catch (e) {
    console.error(e)
    return { props: { data: null, id } }
  }
}

export default Thread
