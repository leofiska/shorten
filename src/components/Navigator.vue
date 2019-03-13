<template>
  <b-navbar toggleable="md" type="dark" variant="dark" :sticky="true">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand v-if="this.menu.img" to="/"><img :alt="this.menu.alt" :src="'https://'+this.baseUrl+'/'+this.menu.img.src" /></b-navbar-brand>
    <b-navbar-brand v-else to="/">{{this.menu.alt}}</b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :to="item.path" v-for="item in routes" :key="item.path" :disabled="!online" v-if="item.meta.alias !== undefined && ((item.meta.isDisplayed === true && (item.meta.alwaysVisible || (item.meta.requireAuth && user !== null && item.meta.permissions === undefined) || (item.meta.requireAuth && user !== null && item.meta.permissions !== undefined && item.meta.permissions.filter(value => -1 !== user.permissions.indexOf(value)).length !== 0) || (!item.meta.requireAuth && ((user === null && item.meta.guestOnly) || !item.meta.guestOnly)))))">{{sentences.navigator[item.meta.alias]}}</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" v-if="ltoken">
        <b-nav-item-dropdown right :disabled="!online" :text="sentences.navigator.account">
          <b-dropdown-item to="/profile" v-if="ltoken" :disabled="!online">{{sentences.navigator.profile}}</b-dropdown-item>
          <b-dropdown-item @click.prevent="logout" v-if="ltoken" :disabled="!online">{{sentences.navigator.signout}}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" v-else>
         <b-nav-item v-b-modal.login :disabled="!online" @click.prevent="login_focus_timer">{{sentences.navigator.signin}}</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>

export default {
  name: 'navigator',
  data () {
    return {
      local_sentences: [
        {
          alias: 'en-us',
          content:
          {
            account: 'Account',
            signin: 'Sign-In',
            profile: 'Profile',
            signout: 'Sign-Out',
            menu: [
              'About',
              'Home',
              'Network',
              'Inventory'
            ]
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            account: 'Conta',
            signin: 'Entrar',
            profile: 'Perfil',
            signout: 'Sair',
            menu: [
              'Sobre',
              'Home',
              'Rede',
              'Inventário'
            ]
          }
        }
      ],
      s: {
      },
      items: {
        tid: -1
      }
    }
  },
  props: [
    'ltoken',
    'token',
    'online',
    'menu',
    'language',
    'baseUrl',
    'user',
    'sentences'
  ],
  created: function () {
  },
  methods: {
    login_focus_timer () {
      setTimeout(this.login_focus, 50)
    },
    login_focus () {
      var el1 = document.getElementById('email')
      if (el1 !== null && el1 !== undefined) {
        if (el1.value !== '') {
          var el2 = document.getElementById('password')
          if (el2 === null || el2 === undefined) {
            el1.focus()
          } else {
            if (el2.value === '') {
              el2.focus()
            }
          }
        } else {
          el1.focus()
        }
      }
    },
    logout () {
      this.$emit('sendonly', { method: 'logout', storno: this.storno, context: this, sync: this.items, options: { f: 'logout' } })
      if (this.$route.name === 'profile') {
        this.$router.push('/home')
      }
    },
    storno (obj) {
      this.$emit('setloading', false)
      if (obj.error === false) {
        this.$emit('setltoken', null)
        if (localStorage.getItem('ltoken') !== undefined && localStorage.getItem('ltoken') !== null) {
          this.$emit('sendonly', { method: 'token', options: { f: 'reauth' } })
        }
        localStorage.removeItem('ltoken')
        sessionStorage.removeItem('ltoken')
      }
    }
  },
  watch: {
  },
  computed: {
    routes () {
      return this.$router.options.routes
    }
  }
}
</script>

<style scoped>
div .navbar {
  background-color: #3A4349 !important;
}
* {
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -o-user-select:none;
  user-select:none;
}
</style>
