<template>
  <div>
    <v-api ref='api' :baseUrl="baseUrl" :id="id" @setid="id = $event" :token="token" @settoken="token = $event" :stoken="stoken" @setstoken="stoken = $event" :online="online" @setOnline="online = $event" />
    <Navigator :token="token" @settoken="token = $event" :stoken="stoken" @setstoken="stoken = $event" :online="online" :title="title" :menu="menu" :baseUrl="baseUrl"/>
    <div id="app">
      <Loading v-if="this.loading" :loading="this.loading" />
      <router-view @fetch="fetch" @subscribe="subscribe" @unsubscribe="unsubscribe" :title="title" :online="online" :id="id" :token="token" :stoken="stoken" :loading="this.loading" @setloading="loading = $event" />
    </div>
    <Footer />
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
      title: 'sho.ovh - URL Shortener',
      menu: {
        alt: 'sho.ovh'
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
