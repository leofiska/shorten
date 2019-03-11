<template>
  <div>
    <p>{{this.s.processing}}</p>
    <p>{{this.loginAnswer}}</p>
  </div>
</template>
<script>
export default {
  name: 'loading',
  props: [
    'title',
    'token',
    'loading',
    'online',
    'language'
  ],
  data () {
    return {
      loginAnswer: '',
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            processing: 'Processing login',
            success: 'user found!!',
            e404: 'invalid or expired authentication'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            processing: 'Processando autenticação',
            success: 'usuário encontrado!!',
            e404: 'Autenticação inválida ou expirada'
          }
        }
      ],
      s: {
      },
      items: { tid: -1, elements: [] }
    }
  },
  mounted () {
    document.title = this.title
    this.$emit('setloading', true)
    this.$emit('fetch', { method: 'login', storno: this.storno, context: this, sync: this.items, options: { f: 'autologin_passcode', id: this.$route.params.id, pass: this.$route.params.pass, time: this.$route.params.time, keep: true } })
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
      switch (obj.f) {
        case 'login_password':
          if (obj.error !== false) {
            switch (obj.error) {
              case 404:
                console.log(obj)
                this.$router.push('/')
                break
            }
          } else {
            localStorage.removeItem('ltoken')
            sessionStorage.removeItem('ltoken')
            if (obj.content.keep === true) {
              localStorage.setItem('ltoken', obj.content.ltoken)
            } else {
              sessionStorage.setItem('ltoken', obj.content.ltoken)
            }
            this.$emit('setltoken', obj.content.ltoken)
          }
          this.$router.push('/')
          break
      }
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
.link {
  cursor: pointer;
  transition: all 0.1s ease-in-out 0s;
  -webkit-transition: all 0.1s ease-in-out 0s;
  -o-transition: all 0.1s ease-in-out 0s;
  -moz-transition: all 0.1s ease-in-out 0s;
}
.link:hover {
  color: #b4b4b4;
}
</style>
