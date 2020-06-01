import React from 'react'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
import useAuthentication from '../imports/useAuthentication'

const Index = () => {
  const authentication = useAuthentication()

  return (
    <React.StrictMode>
      <Title
        title='Forums - Mythic'
        description='Forums for the Mythic Minecraft community.'
        url='/'
      />
      <Layout>
        Logged in status: {JSON.stringify(authentication, null, 1)}
        <br />
        <AnchorLink href='/forums'>
          <span style={{ color: 'blue' }}>View forums.</span>
        </AnchorLink>
        <br />
        <AnchorLink href='/members'>
          <span style={{ color: 'blue' }}>View a list of members.</span>
        </AnchorLink>
      </Layout>
    </React.StrictMode>
  )
}

export default Index
