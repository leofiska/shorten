import Vue from 'vue'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.min.css'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.min.js'
import router from './router'
import api from '@/lib/api'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Clipboard from 'v-clipboard'

Vue.use(BootstrapVue)
Vue.use(Clipboard)
Vue.component('v-api', api)
Vue.component('icon', Icon)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  api,
  template: '<App/>',
  components: { App }
})
