import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import About from '@/components/About'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next({
      name: 'home',
      path: '/home',
      params: { nextUrl: to.fullPath }
    })
    return
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('token') === null || localStorage.getItem('token') === undefined) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      let user = JSON.parse(localStorage.getItem('user'))
      if (to.matched.some(record => record.meta.is_admin)) {
        if (user.is_admin === 1) {
          next()
        } else {
          next({name: 'home'})
        }
      } else {
        next()
      }
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (localStorage.getItem('token') == null) {
      next()
    } else {
      next({ name: 'home' })
    }
  } else {
    next()
  }
})

export default router
