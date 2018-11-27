<template>
  <b-navbar toggleable="md" type="dark" variant="dark" :sticky="true">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand v-if="this.menu.img" to="/"><img :alt="this.menu.alt" :src="'https://'+this.baseUrl+'/'+this.menu.img.src" /></b-navbar-brand>
    <b-navbar-brand v-else to="/">{{this.menu.alt}}</b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :to="item.path" v-for="item in items.elements" :key="item.path" :disabled="!online" v-if="( item.meta.alwaysVisible || (item.meta.requireAuth && ltoken !== null) || (!item.meta.requireAuth && (ltoken === null && item.meta.guestOnly || !item.meta.guestOnly)) )">{{s.menu[item.name]}}</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" v-if="ltoken">
        <b-nav-item-dropdown right :disabled="!online" :text="s.account">
          <b-dropdown-item to="/profile" v-if="ltoken" :disabled="!online">{{s.profile}}</b-dropdown-item>
          <b-dropdown-item @click.prevent="logout" v-if="ltoken" :disabled="!online">{{s.signout}}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" v-else>
         <b-nav-item v-b-modal.login :disabled="!online">{{s.signin}}</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>

export default {
  name: 'navigator',
  data () {
    return {
      sentences: [
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
              'Home'
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
              'Home'
            ]
          }
        }
      ],
      s: {
      },
      items: {
        tid: -1,
        elements: [
          {
            name: 1,
            path: '/home',
            meta: {
              alwaysVisible: true,
              requireAuth: false,
              guestOnly: false
            }
          },
          {
            name: 0,
            path: '/about',
            meta: {
              alwaysVisible: true,
              requireAuth: false,
              guestOnly: false
            }
          }
        ]
      }
    }
  },
  props: [
    'ltoken',
    'token',
    'online',
    'menu',
    'language',
    'baseUrl'
  ],
  created: function () {
    for (var i = 0; this.sentences[i] !== undefined; i++) {
      if (this.sentences[i].alias === this.language) {
        this.s = this.sentences[i].content
        return
      }
    }
    this.s = this.sentences[0].content
  },
  methods: {
    logout () {
      this.$emit('setloading', true)
      this.$emit('fetch', { method: 'logout', storno: this.storno, context: this, sync: this.items, options: { f: 'logout' } })
    },
    storno (obj) {
      console.log(JSON.stringify(obj))
      if (obj.error === false) {
        this.$emit('setltoken', null)
        localStorage.removeItem('ltoken')
        sessionStorage.removeItem('ltoken')
      }
    }
  },
  watch: {
    language: function (newVal, oldVal) {
      for (var i = 0; this.sentences[i] !== undefined; i++) {
        if (this.sentences[i].alias === newVal) {
          this.s = this.sentences[i].content
          break
        }
      }
    }
  }
}
</script>

<style scoped>
*:not(input) {
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -o-user-select:none;
  user-select:none;
}
</style>
