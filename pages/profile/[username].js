import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../imports/title'
import Layout from '../../imports/layout'
import useAuthentication from '../../imports/useAuthentication'
import { ip } from '../../config.json'

// TODO: More info (post count, recent posts, etc), data like avatar, role, email, IP.
const Profile = (props) => {
  const router = useRouter()
  const authenticated = useAuthentication()
  const username = props.username || router.query.username

  let accessToken
  const { data, revalidate, error } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + `/public/member/${username}`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.member })

  useEffect(() => {
    if (authenticated) revalidate()
  }, [authenticated, revalidate])

  return (
    <React.StrictMode>
      <Title
        title={`${data.name || 'Member Profile'} - Mythic`}
        description={data.name ? `Profile of member ${data.name}.` : 'Loading...'}
        url={`/profile/${username}`}
      />
      <Layout auth={authenticated}>
        {data && !data.status && (
          <>
            <p>Username: {data.name}</p>
            <p>Last logged in on {new Date(data.lastLogin).toString()}</p>
            <p>Joined the forums on {new Date(data.createdOn).toString()}</p>
          </>
        )}
        {!data && !error && <p>Loading...</p>}
        {data && data.status === 404 && <p>No member exists with this username!</p>}
        {((data && data.status && data.status !== 404) || error) && <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Profile.propTypes = {
  username: PropTypes.string,
  member: PropTypes.object
}

export async function getServerSideProps (context) {
  const username = context.params.username
  try {
    const request = await fetch(ip + `/public/member/${username}`)
    if (request.status === 404) {
      context.res.statusCode = 404
      return { props: { member: { status: 404 }, username } }
    } else if (!request.ok) return { props: { member: null, username } }
    const response = await request.json()
    return { props: { member: response, username } }
  } catch (e) {
    console.error(e)
    return { props: { member: null, username } }
  }
}

export default Profile
