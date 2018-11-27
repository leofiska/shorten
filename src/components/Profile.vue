<template>
  <div>
    <h2>{{title}}</h2>
    <h5>{{s.profile}}</h5>
  </div>
</template>

<script>

export default {
  name: 'profile',
  data () {
    return {
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            profile: 'Profile',
            clear_tooltip: 'clears all'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            profile: 'Perfil',
            clear_tooltip: 'limpar tudo'
          }
        }
      ],
      s: {
      }
    }
  },
  props: [
    'title',
    'language'
  ],
  mounted () {
    document.title = this.title
  },
  created () {
    for (var i = 0; this.sentences[i] !== undefined; i++) {
      if (this.sentences[i].alias === this.language) {
        this.s = this.sentences[i].content
        return
      }
    }
    this.s = this.sentences[0].content
  },
  methods: {
    storno (obj) {
      this.$emit('setloading', false)
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
