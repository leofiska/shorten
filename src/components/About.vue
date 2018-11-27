<template>
  <div>
    <h2>{{title}}</h2>
    <h4>{{s.about}}</h4>
    <div class='container text-center text-md-left'>
      <p>{{s.description_1}}</p>
      <br />
      <p>{{s.description_2}}</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            about: 'About',
            description_1: 'The service has been started on November 19th, 2018 and it is totally free of charge with no ads and no tracking, as it should be provided forever',
            description_2: 'Suggestions are welcome, please use the e-mail in the footer of the page. New features will continue to be implemented'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            about: 'Sobre',
            description_1: 'Este serviço foi iniciado em 19 de novembro de 2018 e é totalmente gratuito, livre de anúncios e rastreios, como deve permenecer para sempre',
            description_2: 'Sugestões são bem-vindas!! Utilize o e-mail que está no rodapé da página para fazê-las. Novas facilidades continuarão a ser implementadas'
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
