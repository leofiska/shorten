import Home from '@/components/Home'
import Profile from '@/components/Profile'
import About from '@/components/About'
import Passcode from '@/components/Passcode'

export default {
  routes:
  [
    {
      path: '/home',
      name: 'home',
      alias: 'home',
      component: Home,
      meta:
      {
        alwaysVisible: true,
        requireAuth: false,
        guestOnly: false,
        isDisplayed: true
      }
    },
    {
      path: '/about',
      name: 'about',
      alias: 'about',
      component: About,
      meta:
      {
        alwaysVisible: true,
        requireAuth: false,
        guestOnly: false,
        isDisplayed: true
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta:
      {
        alwaysVisible: true,
        requireAuth: true,
        guestOnly: false,
        isDisplayed: false
      }
    },
    {
      path: '/passcode/:time/:id/:pass',
      name: 'passcode',
      component: Passcode,
      meta:
      {
        alwaysVisible: false,
        requireAuth: false,
        guestOnly: true,
        isDisplayed: false
      }
    }
  ]
}
