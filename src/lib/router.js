import Vue from 'vue'
import Router from 'vue-router'
import routes from '@/lib/routes.js'

Vue.use(Router)

let router = new Router(routes)

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next({
      name: 'home',
      path: '/home',
      params: { nextUrl: to.fullPath }
    })
    return
  }
  if (to.name === null) {
    next({name: 'home'})
  }
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (localStorage.getItem('ltoken') !== null) {
      next()
    } else {
      next({name: 'home'})
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (localStorage.getItem('ltoken') == null) {
      next()
    } else {
      next({ name: 'home' })
    }
  } else {
    next()
  }
})

export default router
