import useSWR from 'swr'
import { ip } from '../config.json'
import { useState, useEffect } from 'react'

/**
 * @return {null|boolean|object} The member if authenticated, null if uncertain, false if not.
 */
const useAuthentication = () => {
  const [authenticated, setAuthenticated] = useState(null)

  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + '/api/member/@me'
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status !== 200 ? { status: e.status } : e.json()))

  useEffect(() => {
    (async () => {
      if (data && !data.status && data.name) setAuthenticated(data)
      else if (data && (data.status === 401 || data.status === 403)) {
        let refreshToken
        try { refreshToken = localStorage.getItem('refreshToken') } catch (e) { return }
        if (refreshToken && refreshToken !== 'null') {
          const request = await fetch(ip + '/refreshToken', { headers: { authorization: refreshToken } })
          if (request.status === 200) {
            localStorage.setItem('accessToken', (await request.json()).accessToken)
            setAuthenticated(null)
            await revalidate()
            return
          }
        }
        setAuthenticated(false)
      } else setAuthenticated(null)
    })()
  }, [data, revalidate])

  return authenticated
}

export default useAuthentication
