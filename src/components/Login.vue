<template>
  <b-modal hide-footer id="login" :title="s.signin">
    <b-form @submit="onSubmit">
      <b-form-group :label="s.username + ':'" label-for="username">
        <b-form-input id="username" type="text" v-model="username" required :placeholder="s.username"></b-form-input>
      </b-form-group>
      <b-form-group :label="s.password + ':'" label-for="password">
        <b-form-input id="password" type="password" v-model="password" required :placeholder="s.password"></b-form-input>
      </b-form-group>
       <b-form-checkbox-group v-model="keep">
          <b-form-checkbox value="keep">{{s.keep}}</b-form-checkbox>
        </b-form-checkbox-group>
      <br />
      <b-alert :show="dismissCountDown"
        fade
        variant="transparent"
        @dismissed="dismissCountDown=0"
        @dismiss-count-down="countDownChanged">
        <p>{{loginAnswer}}</p>
      </b-alert>
      <p class='text-right'>
        <b-button type="submit" variant="primary">{{s.signin}}</b-button>
        <b-button type="button" variant="secondary" @click.prevent="clear">{{s.clear}}</b-button>
        <b-button type="button" variant="danger" @click.prevent="hide">{{s.close}}</b-button>
      </p>
    </b-form>
  </b-modal>
</template>
<script>
export default {
  name: 'loading',
  props: [
    'online',
    'language'
  ],
  data () {
    return {
      loginAnswer: 'answer',
      dismissSecs: 3,
      dismissCountDown: 0,
      username: '',
      password: '',
      keep: 'keep',
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            clear: 'Clear',
            close: 'Close',
            keep: 'keep signed',
            password: 'password',
            username: 'username',
            signin: 'Sign-In'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            clear: 'Limpar',
            close: 'Fechar',
            keep: 'manter autenticado',
            password: 'senha',
            username: 'usuário',
            signin: 'Autenticar'
          }
        }
      ],
      s: {
      },
      items: { tid: -1, loading: true, elements: [] }
    }
  },
  mounted () {
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
    onSubmit (evt) {
      evt.preventDefault()
      this.login()
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    login () {
      this.$emit('setloading', true)
      this.dismissCountDown = 0
      this.$emit('login', this.username, this.password)
    },
    clear () {
      this.username = ''
      this.password = ''
    },
    hide () {
      this.$root.$emit('bv::hide::modal', 'login')
    },
    storno (obj) {
      this.$emit('setloading', false)
      this.dismissCountDown = this.dismissSecs
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
    },
    keep: function (newVal, oldVal) {
      console.log(newVal + '<-' + oldVal)
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
