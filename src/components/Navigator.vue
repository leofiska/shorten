<template>
  <b-navbar toggleable="md" type="dark" variant="dark" :sticky="true">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand v-if="this.menu.img" to="/"><img :alt="this.menu.alt" :src="'https://'+this.baseUrl+'/'+this.menu.img.src" /></b-navbar-brand>
    <b-navbar-brand v-else to="/">{{this.menu.alt}}</b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :to="item.path" v-for="item in items.elements" :key="item.path" :disabled="!online" v-if="( item.meta.alwaysVisible || (item.meta.requireAuth && ltoken !== null) || (!item.meta.requireAuth && (ltoken === null && item.meta.guestOnly || !item.meta.guestOnly)) )">{{s.menu[item.name]}}</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right :disabled="!online" text="Account">
          <b-dropdown-item to="/login" v-if="!ltoken" :disabled="!online">Sign-In</b-dropdown-item>
          <b-dropdown-item to="/profile" v-if="ltoken" :disabled="!online">Profile</b-dropdown-item>
          <b-dropdown-item @click.prevent="logout" v-if="ltoken" :disabled="!online">Sign-Out</b-dropdown-item>
        </b-nav-item-dropdown>
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
