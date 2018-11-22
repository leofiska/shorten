<template>
  <div>
    <v-api ref='api' :baseUrl="baseUrl" :id="id" @setid="id = $event" :token="token" @settoken="token = $event" :stoken="stoken" @setstoken="stoken = $event" :online="online" @setOnline="online = $event" :default_language="default_language" language="language" />
    <Navigator :token="token" @settoken="token = $event" :stoken="stoken" @setstoken="stoken = $event" :online="online" :title="title" :menu="menu" :baseUrl="baseUrl" :default_language="default_language" language="language" />
    <div id="app">
      <Loading v-if="this.loading" :loading="this.loading" :default_language="default_language" language="language" />
      <router-view @fetch="fetch" @subscribe="subscribe" @unsubscribe="unsubscribe" :title="title" :online="online" :id="id" :token="token" :stoken="stoken" :loading="this.loading" @setloading="loading = $event" :default_language="default_language" language="language" />
    </div>
    <Footer :default_language="default_language" language="language" />
  </div>
</template>

<script>
import Navigator from '@/components/Navigator'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading.vue'

export default {
  name: 'App',
  data () {
    return {
      baseUrl: 'sho.ovh',
      loading: false,
      id: null,
      token: localStorage.getItem('token'),
      stoken: sessionStorage.getItem('stoken'),
      online: false,
      title: 'Light URL Shortener',
      default_language: navigator.language,
      language: navigator.language,
      menu: {
        alt: 'sho.ovh',
        img: {
          src: 'favicon-32x32.png'
        }
      }
    }
  },
  beforeCreate () {
    document.title = this.title
  },
  components: {
    Navigator,
    Footer,
    Loading
  },
  methods: {
    fetch (request) {
      this.$refs.api.fetch(request)
    },
    subscribe (request) {
      this.$refs.api.subscribe(request)
    },
    unsubscribe (request) {
      this.$refs.api.unsubscribe(request)
    }
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 2rem;
  margin-bottom: 1.5rem;
  min-height: 100vh;
  position: relative;
}
</style>
