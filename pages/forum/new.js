import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import Title from '../../imports/title'
import Layout from '../../imports/layout'
import useAuthentication from '../../imports/useAuthentication'
import { ip } from '../../config.json'

// TODO: Support icon, readable roles and writable roles. Check perms from useAuthentication AOT.
const NewForum = () => {
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

  const handleNewForum = async () => {
    if (!name || !slug || !description) return
    setInvalidSlug(false)
    if (!slug.match(/^[a-z0-9_-]*$/)) return setInvalidSlug(true)
    try {
      setFetching(true)
      const authorization = localStorage.getItem('accessToken')
      const request = await fetch(ip + '/api/forum', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify(
          { name, slug, description, icon: '', readableRoleIds: [], writeableRoleIds: [] }
        )
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

  // Assume the user is forbidden, until authentication data is available.
  if (!authenticated) {
    return (
      <React.StrictMode>
        <Title
          noIndex
          title='Create New Forum - Mythic'
          description='Create a new forum category.'
          url='/forum/new'
        />
        <Layout auth={authenticated}>
          <span>You are not permitted to visit this area!</span>
        </Layout>
      </React.StrictMode>
    )
  }
  return (
    <React.StrictMode>
      <Title
        noIndex
        title='Create New Forum - Mythic'
        description='Create a new forum category.'
        url='/forum/new'
      />
      <Layout auth={authenticated}>
        <h2>Create New Forum</h2>
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
          <button onClick={handleNewForum} disabled={fetching || !name || !slug || !description}>
            Create
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

export default NewForum
