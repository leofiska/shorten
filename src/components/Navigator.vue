<template>
  <b-navbar type="light" variant="light" :sticky="true">
    <b-navbar-brand v-if="this.menu.img" to="/"><img :alt="this.menu.alt" :src="'https://'+this.baseUrl+'/'+this.menu.img.src" /></b-navbar-brand>
    <b-navbar-brand v-else to="/">{{this.menu.alt}}</b-navbar-brand>
  </b-navbar>
</template>

<script>

export default {
  name: 'navigator',
  data () {
    return {
      items: {
        tid: -1,
        loading: true,
        elements: [
          {
            name: 'Home',
            path: '/home',
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
    'menu',
    'baseUrl'
  ],
  created: function () {
  },
  methods: {
    logout: function () {
      this.$emit('logout')
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
