<template>
  <b-modal hide-footer id="login" :title="s.signin">
    <b-form @submit="onSubmit">
      <b-form-group :label="s.email + ':'" label-for="email">
        <b-form-input id="email" type="email" v-model="email" required :placeholder="s.email"></b-form-input>
      </b-form-group>
      <b-form-group v-if="this.onetimepasscode === false" :label="s.password + ':'" label-for="password">
        <b-form-input id="password" type="password" v-model="password" required></b-form-input>
      </b-form-group>
      <b-form-group v-else :label="this.s.passcode + ':'" label-for="passcode">
        <b-form-input id="passcode" type="password" v-model="passcode" required></b-form-input>
      </b-form-group>
       <b-form-checkbox-group v-model="keep">
          <b-form-checkbox>{{s.keep}}</b-form-checkbox>
        </b-form-checkbox-group>
      <br />
      <span v-if="this.onetimepasscode === false" class='link' @click="this.enableOnetimepasscodeMode">{{this.s.onetimepasscode}}</span>
      <span v-else class='link' @click="this.enablePasswordMode">{{this.s.passwordmode}}</span>
      <div class='position-relative text-center' style='min-height: 8rem;'>
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
        <p class='text-right'>
          <b-button v-if="this.onetimepasscode === true && this.requestPasscodeCountdown === 0" type="button" @click.prevent="requestPasscode" variant="primary">{{s.request_passcode}}</b-button>
          <b-button v-if="this.onetimepasscode === true && this.requestPasscodeCountdown !== 0" :disabled="true" type="button" variant="primary">{{s.request_passcode}} ({{this.requestPasscodeCountdown}})</b-button>
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
      onetimepasscode: false,
      success: false,
      requestPasscodeCountdown: 0,
      loginAnswer: 'answer',
      dismissSecs: 3,
      dismissCountDown: 0,
      email: '',
      password: '',
      passcode: '',
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
            e404: 'user not found or invalid password',
            onetimepasscode: 'Click here to receive a one time login passcode in your email',
            passwordmode: 'Click here to use your password to login',
            passcode: 'onetime passcode',
            request_passcode: 'request passcode',
            requested_passcode: 'login passcode sent to your registered e-mail, if found'
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
            e404: 'usuário não encontrado ou senha inválida',
            onetimepasscode: 'Clique aqui para receber um código para login de uso único no seu e-mail',
            passwordmode: 'Use sua senha para fazer login',
            passcode: 'código de uso único',
            request_passcode: 'requisitar código de login',
            requested_passcode: 'código de login temporário enviado ao seu e-mail registrado, se encontrado'
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
    enableOnetimepasscodeMode () {
      this.onetimepasscode = true
      this.password = ''
    },
    enablePasswordMode () {
      this.onetimepasscode = false
      this.passcode = ''
    },
    loginOnetimepasscodemode () {
      this.$emit('setloading', true)
      this.dismissCountDown = 0
      this.$emit('fetch', { method: 'user', storno: this.storno, context: this, sync: this.items, options: { f: 'forgot_password', id: this.email } })
    },
    requestPasscode () {
      console.log('requesting')
      this.$emit('fetch', { method: 'user', storno: this.storno, context: this, sync: this.items, options: { f: 'request_passcode', id: this.email, language: this.language } })
      this.requestPasscodeCountdown = 60
      this.decreasePasscodeCountdown()
    },
    decreasePasscodeCountdown () {
      if (this.requestPasscodeCountdown <= 0) return
      this.requestPasscodeCountdown--
      setTimeout(() => { this.decreasePasscodeCountdown() }, 1000)
    },
    login () {
      this.$emit('setloading', true)
      this.dismissCountDown = 0
      if (this.onetimepasscode === false) {
        this.$emit('fetch', { method: 'login', storno: this.storno, context: this, sync: this.items, options: { f: 'login_password', id: this.email, pass: this.password, keep: this.keep } })
      } else {
        this.$emit('fetch', { method: 'login', storno: this.storno, context: this, sync: this.items, options: { f: 'login_passcode', id: this.email, pass: this.passcode, keep: this.keep } })
      }
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
      switch (obj.f) {
        case 'request_passcode':
          this.loginAnswer = this.s.requested_passcode
          this.dismissCountDown = this.dismissSecs
          break
        case 'login_password':
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
