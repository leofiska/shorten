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
      array: 1,
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
      array: 0,
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
      array: 2,
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
      array: 2,
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
