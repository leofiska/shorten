<template>
  <b-dropdown id='ddown-dropup' :text="this.s.language" variant='transparent' class='m-2'>
    <b-dropdown-item v-for="l in languages" href="#" :key="l.alias" v-on:click.prevent="change_language(l.alias)">{{l.name}}</b-dropdown-item>
  </b-dropdown>
</template>
<script>
export default {
  name: 'language',
  props: [
    'default_language',
    'language'
  ],
  data () {
    return {
      s: {
        language: 'English (United States)'
      },
      languages: [
        { alias: 'en-us', name: 'English (United Stated)', international: 'English (United States)' },
        { alias: 'pt-br', name: 'Português (Brasil)', international: 'Portuguese (Brazil)' }
      ]
    }
  },
  mounted () {
    var l = localStorage.getItem('language')
    var i = 0
    if (l !== null && l !== undefined) {
      for (i = 0; this.languages[i] !== undefined; i++) {
        if (this.languages[i].alias === l) {
          this.s.language = this.languages[i].name
          this.$emit('setlanguage', l)
          return
        }
      }
      localStorage.removeItem('language')
    } else {
      l = navigator.language.toLowerCase()
      for (i = 0; this.languages[i] !== undefined; i++) {
        if (this.languages[i].alias === l) {
          this.s.language = this.languages[i].name
          this.$emit('setlanguage', l)
          return
        }
      }
      localStorage.setItem('language', 'en-us')
    }
  },
  methods: {
    change_language: function (nl) {
      this.$emit('setlanguage', nl)
      localStorage.setItem('language', nl)
      for (var i = 0; this.languages[i] !== undefined; i++) {
        if (this.languages[i].alias === nl) {
          this.s.language = this.languages[i].name
          return
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
