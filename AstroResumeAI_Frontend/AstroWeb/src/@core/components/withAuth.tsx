import { ConsoleLine } from 'mdi-material-ui'
import { GetServerSideProps, GetServerSidePropsContext } from 'next/types'
import { parseCookies } from 'nookies'

export function withAuth(gssp?: GetServerSideProps): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    const { req, resolvedUrl } = context
    const cookies = parseCookies({ req })
    const token = cookies.token

    // Check if the current URL is the login or register page
    const isAuthPage = resolvedUrl.startsWith('/pages/login') || resolvedUrl.startsWith('/pages/register')

    if (token && isAuthPage) {
      // If the user is already authenticated and tries to access login or register pages, redirect to home
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    } else if (!token && !isAuthPage) {
      // If the user is not authenticated and is trying to access a protected route, redirect to login
      return {
        redirect: {
          destination: '/pages/login',
          permanent: false
        }
      }
    }

    // If there is a token and gssp is provided, call it for further page-specific data fetching
    if (token && gssp) {
      return gssp(context)
    }

    // If no gssp is provided, or the user is accessing an unprotected route without authentication, just proceed with rendering the page
    return { props: {} }
  }
}
