<template>
  <footer v-if="this.sentences !== null && this.sentences.bottom !== undefined">
      <div class="container text-center text-md-left">
        <div class="row">
          <div class="col-md-4 mx-auto text-center">
            <h5 class="font-weight-bold mt-3 mb-4">{{title[this.language_code]}}</h5>
            <p>{{sentences.bottom.simplify}}</p>
          </div>
          <hr class="d-md-none">
          <div class="col-md-2 mx-auto">
            <h5 class="font-weight-bold mt-3 mb-4">{{sentences.bottom.links}}</h5>
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
            <h5 class="font-weight-bold mt-3 mb-4">{{sentences.bottom.language}}</h5>
            <div class='d-inline-block'>
              <Language :language="language" @setlanguage="setlanguage" />
            </div>
          </div>
        </div>
      <hr>
      <p class="text-center">{{sentences.bottom.follow_on_social}}</p>
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
    }
  },
  props: [
    'title',
    'language',
    'language_code',
    'sentences'
  ],
  mounted () {
  },
  methods: {
    setlanguage: function (nl) {
      this.$emit('setlanguage', nl)
    },
    setsentences: function (obj) {
      console.log(obj)
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
