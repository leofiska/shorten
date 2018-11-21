import Vue from 'vue'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.min.css'
// import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.min.js'
import router from './router'
import api from '@/lib/api'
import Clipboard from 'v-clipboard'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// eslint-disable-next-line
import { faCopy } from '@fortawesome/free-solid-svg-icons'
// eslint-disable-next-line
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
// eslint-disable-next-line
import { faTrash } from '@fortawesome/free-solid-svg-icons'
// eslint-disable-next-line
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
// eslint-disable-next-line
import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
// eslint-disable-next-line
import bButton from 'bootstrap-vue/es/components/button/button';
// eslint-disable-next-line
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
// eslint-disable-next-line
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
// eslint-disable-next-line
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
// eslint-disable-next-line
import bAlert from 'bootstrap-vue/es/components/alert/alert';

library.add(faSpinner, faCopy, faTrash)

// Vue.use(BootstrapVue)
Vue.use(Clipboard)
Vue.component('v-api', api)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('b-navbar', bNavbar)
Vue.component('b-navbar-brand', bNavbarBrand)
Vue.component('b-button', bButton)
Vue.component('b-form-input', bFormInput)
Vue.component('b-input-group', bInputGroup)
Vue.component('b-input-group-append', bInputGroupAppend)
Vue.component('b-alert', bAlert)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  api,
  template: '<App/>',
  components: { App }
})
