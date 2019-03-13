<template>
  <div>
    <v-api ref='api' @fillSequency="fillSequency" :user="user" @setuser="setuser" :apiUrl="apiUrl" :id="id" @setid="id = $event" :token="token" @setready="ready = $event" @settoken="token = $event" :ltoken="ltoken" @setltoken="ltoken = $event" :stoken="stoken" @setstoken="stoken = $event" :online="online" @setOnline="online = $event" :language="language" :language_code="language_code" />
    <div v-if="this.ready === true && this.show === true && this.sentences !== null">
      <Navigator v-if="this.sentences !== null" :sentences="sentences" :token="token" @settoken="token = $event" :user="user" :stoken="stoken" @setstoken="stoken = $event" :ltoken="ltoken" @setltoken="ltoken = $event" :online="online" :title="title" :menu="menu" :baseUrl="baseUrl" :language="language" @fetch="fetch" @sendonly="sendonly" :language_code="language_code" />
      <Login v-if="this.sentences !== null && ltoken === null" :sentences="sentences" :language="language" :language_code="language_code" :online="online" @fetch="fetch" @sendonly="sendonly" @setloading="loading = $event" @setltoken="ltoken = $event" />
      <Loading v-if="this.loading" :loading="this.loading" :language="language" />
      <div id="app" v-if="(this.$route.meta.alwaysVisible || (this.$route.meta.requireAuth && user !== null && this.$route.meta.permissions === undefined) || (this.$route.meta.requireAuth && user !== null && this.$route.meta.permissions !== undefined && this.$route.meta.permissions.filter(value => -1 !== user.permissions.indexOf(value)).length !== 0) || (!this.$route.meta.requireAuth && ((user === null && this.$route.meta.guestOnly) || !this.$route.meta.guestOnly)))">
        <router-view v-if="this.sentences !== null && this.sentences[this.$route.meta.alias] !== undefined" @fetch="fetch" :sentences="sentences" @sendonly="sendonly" @subscribe="subscribe" @unsubscribe="unsubscribe" :user="user"  :title="title" :online="online" :id="id" :token="token" :stoken="stoken" :loading="this.loading" @setltoken="ltoken = $event" @setloading="loading = $event"  :language="language" :language_code="language_code" />
      </div>
      <div id="app" v-else>
        {{this.local_sentences[0].content.notallowed}}
      </div>
      <Footer v-if="this.sentences !== null" :sentences="sentences" :language="language" :language_code="language_code" @setlanguage="setlanguage" :title="title" />
    </div>
    <div v-else style='width: 100vw; height: 100vh; margin: 0; padding: 0; display: table;'>
      <div style='display: table-row;'>
        <div style='display: table-cell; vertical-align: middle; text-align: center;'>
          {{this.local_sentences[0].content.loading}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navigator from '@/components/Navigator'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'
import Login from '@/components/Login'

import config from '@/lib/config.json'

export default {
  name: 'App',
  data () {
    return {
      show: true,
      ready: false,
      baseUrl: config.baseUrl,
      apiUrl: config.apiUrl,
      loading: false,
      id: null,
      user: null,
      token: localStorage.getItem('token'),
      stoken: sessionStorage.getItem('stoken'),
      ltoken: sessionStorage.getItem('ltoken') || localStorage.getItem('ltoken'),
      online: false,
      title: config.title,
      language: null,
      language_code: null,
      menu: {
        alt: 'sias',
        img: {
          src: 'favicons/favicon-32x32.png'
        }
      },
      local_sentences: [
        {
          alias: 'en-us',
          content:
          {
            notallowed: 'You don\'t have permission to access this page',
            loading: 'Loading'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            notallowed: 'Você não tem permissão para ver esta página',
            loading: 'Carregando'
          }
        }
      ],
      sentences: null,
      sequency: null
    }
  },
  beforeCreate () {
  },
  created () {
    if (this.user === null) {
      this.setlanguage(navigator.language.toLowerCase())
    }
  },
  mounted () {
  },
  components: {
    Navigator,
    Footer,
    Loading,
    Login
  },
  methods: {
    fillSequency (obj) {
      if (obj === null || obj === undefined || obj.objects === null || obj.objects === undefined) {
        return
      }
      var i = 0
      var j = 0
      if (this.sequency === null) {
        this.sequency = obj.objects
      } else {
        for (i = 0; obj.objects[i] !== undefined; i++) {
          for (j = 0; this.sequency[j] !== undefined; j++) {
            if (this.sequency[j].alias === obj.objects[i].alias) {
              for (var k in obj.objects[i].content) {
                this.sequency[j].content[k] = obj.objects[i].content[k]
              }
            }
          }
        }
      }
      for (i = 0; this.sequency[i] !== undefined; i++) {
        if (this.sequency[i].alias === this.language) {
          this.sentences = this.sequency[i].content
          break
        }
      }
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
      if (this.sentences !== null && this.sentences[this.$route.meta.alias] === undefined) {
        this.$refs.api.get_sentence(this.$route.meta.alias)
      }
      this.settitle()
    },
    setlanguage (nl) {
      this.language = nl
      switch (nl) {
        case 'pt-br':
          this.language_code = 1046
          break
        case 'en-us':
          this.language_code = 1033
          break
        default:
          this.language_code = 1033
          nl = 'en-us'
          break
      }
      localStorage.setItem('language', nl)
      if (this.user !== null) {
        this.$refs.api.setlanguage(this.language, this.language_code)
      }
    },
    fetch (request) {
      if (this.$refs.api !== undefined) {
        this.loading = true
        this.$refs.api.fetch(request)
      }
    },
    sendonly (request) {
      if (this.$refs.api !== undefined) {
        this.$refs.api.sendonly(request)
      }
    },
    subscribe (request) {
      if (this.$refs.api !== undefined) {
        this.loading = true
        this.$refs.api.subscribe(request)
      }
    },
    unsubscribe (request) {
      if (this.$refs.api !== undefined) {
        this.$refs.api.unsubscribe(request)
      }
    },
    setuser (u) {
      this.user = u
      if (this.user !== null) {
        localStorage.setItem('language', this.user.language.code)
        this.language = this.user.language.code
        this.language_code = this.user.language.codeset
      }
    },
    settitle () {
      if (this.$route.meta !== undefined && this.$route.meta.alias !== undefined) {
        document.title = this.sentences.navigator[this.$route.meta.alias].toLowerCase() + ' | ' + this.title[this.language_code]
      } else {
        document.title = this.title[this.language_code]
      }
    }
  },
  computed: {
    routes () {
      return this.$router.options.routes
    }
  },
  watch: {
    '$route.path': function (newVal, oldVal) {
      this.settitle()
      this.loading = false
      /* eslint-disable */
      if (this.$route.meta.alwaysVisible === true ||
        (this.$route.meta.requireAuth && this.user !== null && this.$route.meta.permissions === undefined) ||
        (this.$route.meta.requireAuth && this.user !== null && this.$route.meta.permissions !== undefined && this.$route.meta.permissions.filter(value => -1 !== this.user.permissions.indexOf(value)).length !== 0) ||
        (!this.$route.meta.requireAuth && ((this.user === null && this.$route.meta.guestOnly) || !this.$route.meta.guestOnly))
      ) {
        if (this.sentences !== null && this.sentences[this.$route.meta.alias] === undefined) {
          this.$refs.api.get_sentence(this.$route.meta.alias)
        }
      } else {
        this.$router.push('/')
      }
      
    },
    'ready': function () {
      /* eslint-disable */
      if (this.$route.meta.alwaysVisible === true ||
        (this.$route.meta.requireAuth && this.user !== null && this.$route.meta.permissions === undefined) ||
        (this.$route.meta.requireAuth && this.user !== null && this.$route.meta.permissions !== undefined && this.$route.meta.permissions.filter(value => -1 !== this.user.permissions.indexOf(value)).length !== 0) ||
        (!this.$route.meta.requireAuth && ((this.user === null && this.$route.meta.guestOnly) || !this.$route.meta.guestOnly))
      ) {
      } else {
        this.$router.push('/')
      }
    },
    language: function (newVal, oldVal) {
      if (this.sequency === null) return;
      for (var i = 0; this.sequency[i] !== undefined; i++) {
        if (this.sequency[i].alias === newVal) {
          this.sentences = this.sequency[i].content
          break
        }
      }
      this.settitle()
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
  z-index: 1000;
}
*:not(input) {
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -o-user-select:none;
  user-select:none;
}
</style>
