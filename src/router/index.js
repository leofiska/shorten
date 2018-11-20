import Vue from 'vue'
import Router from 'vue-router'
import Shorten from '@/components/Shorten'
import Home from '@/components/Home'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/shorten/*',
      name: 'shorten',
      component: Shorten
    }
  ]
})
