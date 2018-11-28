import Home from '@/components/Home'
import Profile from '@/components/Profile'
import About from '@/components/About'

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
    }
  ]
}
