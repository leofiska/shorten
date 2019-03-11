<template>
  <b-dropdown :text="this.s.language" variant='transparent' class='m-2'>
    <b-dropdown-item v-for="l in languages" href="#" :key="l.alias" :id="'lang' + l.alias" v-on:click.prevent="change_language(l.alias)">{{l.name}}</b-dropdown-item>
  </b-dropdown>
</template>

<script>
export default {
  name: 'language',
  props: [
    'language',
    'language_code'
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
          this.change_language(this.languages[i].alias)
          return
        }
      }
      localStorage.removeItem('language')
    } else {
      l = navigator.language.toLowerCase()
      for (i = 0; this.languages[i] !== undefined; i++) {
        if (this.languages[i].alias === l) {
          this.change_language(this.languages[i].alias)
          return
        }
      }
      this.change_language('en-us')
    }
  },
  methods: {
    change_language: function (nl) {
      var el = document.getElementById('lang' + this.language)
      if (el) el.style.display = ''
      this.$emit('setlanguage', nl)
      this.update_language_bar(nl)
    },
    update_language_bar: function (nl) {
      for (var i = 0; this.languages[i] !== undefined; i++) {
        if (this.languages[i].alias === nl) {
          this.s.language = this.languages[i].name
          var el = document.getElementById('lang' + nl)
          if (el) el.style.display = 'none'
          return
        }
      }
    }
  },
  watch: {
    language: function (newVal, oldVal) {
      var el = document.getElementById('lang' + oldVal)
      if (el) el.style.display = ''
      this.update_language_bar(newVal)
    }
  }
}
</script>

<style scoped>
* {
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -o-user-select:none;
  user-select:none;
}
</style>
