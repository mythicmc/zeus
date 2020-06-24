import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../../imports/title'
import Layout from '../../../imports/layout'
import useAuthentication from '../../../imports/useAuthentication'
import { ip } from '../../../config.json'

// TODO: Support icon, readable roles and writable roles.
const EditForum = () => {
  const router = useRouter()
  const slugInput = useRef()
  const descriptionInput = useRef()
  const authenticated = useAuthentication()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [fetching, setFetching] = useState(false)
  const [statusCode, setStatusCode] = useState(200) // Expected values: 200, 403, 500
  const [invalidSlug, setInvalidSlug] = useState(false)

  let accessToken
  const { data, revalidate, error } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    if (!router.query.slug) return
    return ip + `/public/forum/${router.query.slug}`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }))

  useEffect(() => {
    if (authenticated) revalidate()
  }, [authenticated, revalidate])
  useEffect(() => {
    if (!data || data.status) return
    setName(data.name)
    setSlug(data.slug)
    setDescription(data.description)
  }, [data])

  const handleForumEdit = async () => {
    if (!name || !slug || !description) return
    setInvalidSlug(false)
    if (!slug.match(/^[a-z0-9_-]*$/)) return setInvalidSlug(true)
    try {
      setFetching(true)
      const authorization = localStorage.getItem('accessToken')
      const request = await fetch(ip + '/api/forum/' + router.query.slug, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify({ name, slug, description })
      })
      if (request.status === 200) {
        router.push('/forums')
      } else setStatusCode(request.status)
    } catch (e) {
      setStatusCode(null)
      console.error(e)
    }
    setFetching(false)
  }

  if (!authenticated || !data || data.status || error) {
    return (
      <React.StrictMode>
        <Title
          noIndex
          title='Edit Forum - Mythic'
          description='Edit a forum category.'
          url={`/forum/${slug}/edit`}
        />
        <Layout auth={authenticated}>
          {(authenticated === null || (!data && !error)) && <span>Loading...</span>}
          {((data && data.status && data.status !== 401 && data.status !== 403 && data.status !== 404) ||
            error) && authenticated !== null &&
              <span>An unknown error occurred while trying to request.</span>}
          {data && data.status === 404 && <p>This sub-forum does not exist!</p>}
          {data && (data.status === 403 || data.status === 401) &&
            <span>You are not allowed to edit forums!</span>}
        </Layout>
      </React.StrictMode>
    )
  }
  return (
    <React.StrictMode>
      <Title
        noIndex
        title='Edit Forum - Mythic'
        description='Edit a forum category.'
        url={`/forum/${slug}/edit`}
      />
      <Layout auth={authenticated}>
        <h2>Edit Forum</h2>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor='name'>Name: </label>
          <input
            type='text'
            id='name'
            value={name}
            disabled={fetching}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && slugInput.current) slugInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='slug'>Slug: </label>
          <input
            type='text'
            id='slug'
            value={slug}
            disabled={fetching}
            ref={slugInput}
            onChange={e => setSlug(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && descriptionInput.current) descriptionInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='description'>Description: </label>
          <input
            type='text'
            id='description'
            value={description}
            disabled={fetching}
            onChange={e => setDescription(e.target.value)}
          />
          <br /><br />
          <button onClick={handleForumEdit} disabled={fetching || !name || !slug || !description}>
            Edit
          </button>
        </form>
        {(statusCode === 401 || statusCode === 403) && <p>Unauthorized!</p>}
        {statusCode === 409 && <p>A forum with the slug specified already exists!</p>}
        {statusCode !== 200 && statusCode === 401 && statusCode !== 403 && statusCode !== 409 &&
          <p>An unknown error occurred while trying to request.</p>}
        {invalidSlug && <p>Only a-z, 0-9, dashes (-) and underscores (_) are allowed in the forum slug!</p>}
      </Layout>
    </React.StrictMode>
  )
}

export default EditForum
