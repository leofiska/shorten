import Vue from 'vue'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.min.css'
// import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.min.js'
import router from './router'
import api from '@/lib/api'
import Clipboard from 'v-clipboard'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import bNav from 'bootstrap-vue/es/components/nav/nav'
import bNavItemDropDown from 'bootstrap-vue/es/components/nav/nav-item-dropdown'
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar'
import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand'
import bButton from 'bootstrap-vue/es/components/button/button'
import bForm from 'bootstrap-vue/es/components/form/form'
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input'
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group'
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append'
import bAlert from 'bootstrap-vue/es/components/alert/alert'
import bLink from 'bootstrap-vue/es/components/link/link'
import vBTooltip from 'bootstrap-vue/es/directives/tooltip/tooltip'
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown'
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item'

library.add(faSpinner, faCopy, faTrash, faLinkedin, faFacebook)
// Vue.use(BootstrapVue)
Vue.use(Clipboard)
Vue.component('v-api', api)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('b-nav', bNav)
Vue.component('b-nav-item-dropdown', bNavItemDropDown)
Vue.component('b-navbar', bNavbar)
Vue.component('b-navbar-brand', bNavbarBrand)
Vue.component('b-button', bButton)
Vue.component('b-form', bForm)
Vue.component('b-form-input', bFormInput)
Vue.component('b-input-group', bInputGroup)
Vue.component('b-input-group-append', bInputGroupAppend)
Vue.component('b-alert', bAlert)
Vue.component('b-link', bLink)
Vue.component('b-dropdown', bDropdown)
Vue.component('b-dropdown-item', bDropdownItem)

Vue.directive('b-tooltip', vBTooltip)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  api,
  template: '<App/>',
  components: { App }
})
