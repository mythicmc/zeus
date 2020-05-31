import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../../imports/title'
import Layout from '../../../imports/layout'
import useAuthentication from '../../../imports/useAuthentication'
import { ip } from '../../../config.json'

/**
 * @param {string} title The title of the thread to convert to a slug.
 */
const titleToSlug = title => title.toLowerCase().substring(0, 20).replace(' ', '-')

// TODO: Support polls and categoryId. Validate title. Check perms in this forum.
const NewThread = (props) => {
  const router = useRouter()
  const contentInput = useRef()
  const authenticated = useAuthentication()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fetching, setFetching] = useState(false)
  const [statusCode, setStatusCode] = useState(200) // Expected values: 200, 403, 500
  // const [invalidTitle, setInvalidTitle] = useState(false)

  const slug = props.slug || router.query.slug
  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    if (!slug) return
    return ip + `/api/forum/${slug}`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.forum })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])

  const handleNewThread = async () => {
    if (!title || !content) return
    // setInvalidTitle(false)
    // if (!title.match(/^[a-z0-9_-]*$/)) return setInvalidTitle(true)
    try {
      setFetching(true)
      const authorization = localStorage.getItem('accessToken')
      const request = await fetch(ip + '/api/thread', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify(
          { title, content, parentForumId: data.id }
        )
      })
      if (request.status === 200) {
        const thread = await request.json()
        router.push(`/thread/${thread.id}-${titleToSlug(thread.title)}`)
      } else setStatusCode(request.status)
    } catch (e) {
      setStatusCode(null)
      console.error(e)
    }
    setFetching(false)
  }

  if (!authenticated || !data || data.status) {
    return (
      <React.StrictMode>
        <Title
          title='Create New Thread - Mythic'
          description={`Create a new thread in ${data.name || 'the Mythic forums'}.`}
          url={`/threads/${router.query.slug}/new`}
        />
        <Layout>
          {(authenticated === null || !data) && <span>Loading...</span>}
          {data.status && data.status !== 401 && data.status !== 403 &&
            <span>An unknown error occurred while trying to request.</span>}
          {data && (data.status === 403 || data.status === 401) &&
            <span>You are not logged in to create a thread!</span>}
        </Layout>
      </React.StrictMode>
    )
  }
  return (
    <React.StrictMode>
      <Title
        title='Create New Thread - Mythic'
        description={`Create a new thread in ${data.name}.`}
        url={`/threads/${router.query.slug}/new`}
      />
      <Layout>
        <h2>Create New Thread in {data.name}</h2>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor='title'>Title: </label>
          <input
            type='text'
            id='title'
            value={title}
            disabled={fetching}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && contentInput.current) contentInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='content'>Content: </label>
          <br />
          <textarea
            type='text'
            id='content'
            value={content}
            disabled={fetching}
            ref={contentInput}
            onChange={e => setContent(e.target.value)}
          />
          <br /><br />
          <button onClick={handleNewThread} disabled={fetching || !title || !content}>
            Create
          </button>
        </form>
        {(statusCode === 401 || statusCode === 403) && <p>Unauthorized!</p>}
        {statusCode !== 200 && statusCode === 401 && statusCode !== 403 && statusCode !== 409 &&
          <p>An unknown error occurred while trying to request.</p>}
        {/* invalidTitle && <p>Only a-z, 0-9 and underscores (_) are allowed in the thread title!</p> */}
      </Layout>
    </React.StrictMode>
  )
}

NewThread.propTypes = {
  forum: PropTypes.object,
  slug: PropTypes.string
}

/*
export async function getServerSideProps (context) {
  const slug = context.params.slug // Remove slug falsy check from main code.
  const request = await fetch(ip + `/api/forum/${slug}`)
  // Error handling.
  const response = await request.json()
  return { props: { threads: response[0], forum: response[1], slug } }
}
*/

export default NewThread