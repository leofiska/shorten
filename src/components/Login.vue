<template>
  <b-modal hide-footer id="login" :title="s.signin">
    <b-form @submit="onSubmit">
      <b-form-group :label="s.email + ':'" label-for="email">
        <b-form-input id="email" type="email" v-model="email" required :placeholder="s.email"></b-form-input>
      </b-form-group>
      <b-form-group :label="s.password + ':'" label-for="password">
        <b-form-input id="password" type="password" v-model="password" required :placeholder="s.password"></b-form-input>
      </b-form-group>
       <b-form-checkbox-group v-model="keep">
          <b-form-checkbox>{{s.keep}}</b-form-checkbox>
        </b-form-checkbox-group>
      <br />
      <div class='position-relative text-center' style='min-height: 5rem;'>
        <b-alert style='color: #721c24;' :show="!this.success && this.dismissCountDown"
          fade
          variant="transparent"
          @dismissed="dismissCountDown=0"
          @dismiss-count-down="countDownChanged">
          <p>{{loginAnswer}}</p>
        </b-alert>
        <b-alert style='color: #155724;' :show="this.success && this.dismissCountDown"
          fade
          variant="transparent"
          @dismissed="dismissCountDown=0"
          @dismiss-count-down="countDownChanged">
          <p>{{loginAnswer}}</p>
        </b-alert>
      </div>
      <div>
        <p class='text-right'>
          <b-button type="submit" variant="primary">{{s.signin}}</b-button>
          <b-button type="button" variant="secondary" @click.prevent="clear">{{s.clear}}</b-button>
          <b-button type="button" variant="danger" @click.prevent="hide">{{s.close}}</b-button>
        </p>
      </div>
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
      success: false,
      loginAnswer: 'answer',
      dismissSecs: 3,
      dismissCountDown: 0,
      email: '',
      password: '',
      keep: true,
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            clear: 'Clear',
            close: 'Close',
            keep: 'keep signed',
            password: 'password',
            email: 'email',
            signin: 'Sign-In',
            success: 'user found!!',
            e404: 'user not found or invalid password'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            clear: 'Limpar',
            close: 'Fechar',
            keep: 'manter conectado',
            password: 'senha',
            email: 'e-mail',
            signin: 'Entrar',
            success: 'usuário encontrado!!',
            e404: 'usuário não encontrado ou senha inválida'
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
      this.$emit('fetch', { method: 'login', storno: this.storno, context: this, sync: this.items, options: { f: 'login', id: this.email, pass: this.password, keep: this.keep } })
    },
    clear () {
      this.email = ''
      this.password = ''
    },
    hide () {
      this.$root.$emit('bv::hide::modal', 'login')
    },
    storno (obj) {
      this.$emit('setloading', false)
      if (obj.error !== false) {
        switch (obj.error) {
          case 404:
            this.loginAnswer = this.s.e404
            break
        }
      } else {
        this.loginAnswer = this.s.success
        this.success = true
        localStorage.removeItem('ltoken')
        sessionStorage.removeItem('ltoken')
        if (obj.content.keep === true) {
          localStorage.setItem('ltoken', obj.content.ltoken)
        } else {
          sessionStorage.setItem('ltoken', obj.content.ltoken)
        }
        this.$emit('setltoken', obj.content.ltoken)
        this.hide()
      }
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
