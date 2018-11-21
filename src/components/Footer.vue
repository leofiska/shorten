<template>
  <footer>
      <div class="container text-center text-md-left">
        <div class="row">
          <div class="col-md-4 mx-auto text-center">
            <h5 class="font-weight-bold mt-3 mb-4">Light URL Shortener</h5>
            <p>Simplify your links!</p>
          </div>
          <hr class="d-md-none">
          <div class="col-md-2 mx-auto">
            <h5 class="font-weight-bold mt-3 mb-4">Links</h5>
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
            <h5 class="font-weight-bold mt-3 mb-4">Language</h5>
            <div class='d-inline-block text-center'>
              <b-dropdown id='ddown-dropup' text='English (United States)' variant='transparent' class='m-2'>
                <b-dropdown-item href="#">Português (Brazil)</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
        </div>
      <hr>
      <p class="text-center">follow on social networks</p>
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

export default {
  name: 'user',
  data () {
    return {
      domain: 'vue'
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
  }
}
</script>

<style scoped>
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
