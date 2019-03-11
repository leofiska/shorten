<template>
  <footer>
      <div class="container text-center text-md-left">
        <div class="row">
          <div class="col-md-4 mx-auto text-center">
            <h5 class="font-weight-bold mt-3 mb-4">{{title[this.language_code]}}</h5>
            <p>{{s.simplify}}</p>
          </div>
          <hr class="d-md-none">
          <div class="col-md-2 mx-auto">
            <h5 class="font-weight-bold mt-3 mb-4">{{s.links}}</h5>
            <ul class="list-unstyled">
              <li>
                <b-link href="https://soraiaschneider.com.br" target="_blank">soraiaschneider.com.br</b-link>
              </li>
              <li>
                <b-link href="https://zxe.com.br" target="_blank">ZxE</b-link>
              </li>
            </ul>
          </div>
          <hr class='d-md-none'>
          <div class='col-md-3 mx-auto'>
            <h5 class="font-weight-bold mt-3 mb-4">{{s.language}}</h5>
            <div class='d-inline-block'>
              <Language :language="language" @setlanguage="setlanguage" />
            </div>
          </div>
        </div>
      <hr>
      <p class="text-center">{{s.follow_on_social}}</p>
      <p class="text-center">
        <b-link class='bw' style='color: #016FAC' href="https://linkedin.com/in/leofiska" target="_blank"><font-awesome-icon :icon="['fab', 'linkedin']" size="3x" /></b-link>
        <b-link class='bw' style='color: #3B589E' href="https://facebook.com/leofiska" target="_blank"><font-awesome-icon :icon="['fab', 'facebook']" size="3x" /></b-link>
      </p>
      <hr />
      <div class="footer-copyright text-center py-3">© 2018 Copyright:
        <b-link href="mailto:Leonardo Fischer <leonardo@fischers.it>">Leonardo Fischer</b-link>
      </div>
    </div>
  </footer>
</template>

<script>
import Language from '@/components/Language.vue'

export default {
  name: 'user',
  components: {
    Language
  },
  data () {
    return {
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            links: 'Links',
            language: 'Language',
            simplify: 'simplify your links!',
            follow_on_social: 'follow on social networks'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            links: 'Links',
            language: 'Idioma',
            simplify: 'simplifique seus links!',
            follow_on_social: 'siga nas redes sociais'
          }
        }
      ],
      s: {
      }
    }
  },
  props: [
    'title',
    'language',
    'language_code'
  ],
  created () {
    for (var i = 0; this.sentences[i] !== undefined; i++) {
      if (this.sentences[i].alias === this.language) {
        this.s = this.sentences[i].content
        return
      }
    }
    this.s = this.sentences[0].content
  },
  mounted () {
  },
  methods: {
    setlanguage: function (nl) {
      this.$emit('setlanguage', nl)
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
  },
  computed: {
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
.bw:not(:hover) {
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
}
.bw {
  transition: all 0.2s ease-in 0s;
  -webkit-transition: all 0.2s ease-in 0s;
  -o-transition: all 0.2s ease-in 0s;
  -moz-transition: all 0.2s ease-in 0s;
}
</style>
