import Vue from 'vue'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.min.css'
// import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.min.js'
import router from '@/lib/router'
import api from '@/lib/api'
import routes from '@/lib/routes'
import Clipboard from 'v-clipboard'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faTrash, faCopy, faExclamation, faExclamationTriangle, faSave, faTimes, faQuestion, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faFacebook, faInstagram, faTumblr } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import bTable from 'bootstrap-vue/es/components/table/table'
import bTabs from 'bootstrap-vue/es/components/tabs/tabs'
import bTab from 'bootstrap-vue/es/components/tabs/tab'
import bModal from 'bootstrap-vue/es/components/modal/modal'
import bNav from 'bootstrap-vue/es/components/nav/nav'
import bNavForm from 'bootstrap-vue/es/components/nav/nav-form'
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item'
import bNavItemDropDown from 'bootstrap-vue/es/components/nav/nav-item-dropdown'
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar'
import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand'
import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle'
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav'
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse'
import bButton from 'bootstrap-vue/es/components/button/button'
import bForm from 'bootstrap-vue/es/components/form/form'
import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox'
import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group'
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input'
import bFormTextArea from 'bootstrap-vue/es/components/form-textarea/form-textarea'
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select'
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group'
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group'
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append'
import bAlert from 'bootstrap-vue/es/components/alert/alert'
import bLink from 'bootstrap-vue/es/components/link/link'
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown'
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item'
import bContainer from 'bootstrap-vue/es/components/layout/container'
import bRow from 'bootstrap-vue/es/components/layout/row'
import bCol from 'bootstrap-vue/es/components/layout/col'
import bFormRow from 'bootstrap-vue/es/components/layout/form-row'
import bPagination from 'bootstrap-vue/es/components/pagination/pagination'

import vBModal from 'bootstrap-vue/es/directives/modal/modal'
import vBTooltip from 'bootstrap-vue/es/directives/tooltip/tooltip'

library.add(faSpinner, faCopy, faTrash, faExclamation, faSave, faTimes, faLinkedin, faFacebook, faInstagram, faTumblr, faQuestion, faExclamationTriangle, faPlus)
// Vue.use(BootstrapVue)
Vue.use(Clipboard)
Vue.component('v-api', api)
Vue.component('routes', routes)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.component('b-table', bTable)
Vue.component('b-tabs', bTabs)
Vue.component('b-tab', bTab)
Vue.component('b-modal', bModal)
Vue.component('b-nav', bNav)
Vue.component('b-nav-form', bNavForm)
Vue.component('b-nav-item', bNavItem)
Vue.component('b-nav-item-dropdown', bNavItemDropDown)
Vue.component('b-navbar', bNavbar)
Vue.component('b-navbar-brand', bNavbarBrand)
Vue.component('b-navbar-toggle', bNavbarToggle)
Vue.component('b-navbar-nav', bNavbarNav)
Vue.component('b-collapse', bCollapse)
Vue.component('b-button', bButton)
Vue.component('b-form', bForm)
Vue.component('b-form-checkbox', bFormCheckbox)
Vue.component('b-form-checkbox-group', bFormCheckboxGroup)
Vue.component('b-form-input', bFormInput)
Vue.component('b-form-textarea', bFormTextArea)
Vue.component('b-form-select', bFormSelect)
Vue.component('b-form-group', bFormGroup)
Vue.component('b-input-group', bInputGroup)
Vue.component('b-input-group-append', bInputGroupAppend)
Vue.component('b-alert', bAlert)
Vue.component('b-link', bLink)
Vue.component('b-dropdown', bDropdown)
Vue.component('b-dropdown-item', bDropdownItem)
Vue.component('b-container', bContainer)
Vue.component('b-row', bRow)
Vue.component('b-col', bCol)
Vue.component('b-form-row', bFormRow)
Vue.component('b-pagination', bPagination)

Vue.directive('b-modal', vBModal)
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
