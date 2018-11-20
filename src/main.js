import Vue from 'vue'
import App from './App'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import router from './router'
import api from '@/lib/api'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

Vue.use(BootstrapVue)
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
