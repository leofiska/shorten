<template>
  <b-modal v-if="this.sentences !== null && this.sentences.login !== undefined" hide-footer id="login" :title="this.sentences.login.signin">
    <b-form @submit="onSubmit">
      <b-form-group :label="sentences.login.email + ':'" label-for="email">
        <b-form-input id="email" type="email" v-model="email" required :placeholder="sentences.login.email"></b-form-input>
      </b-form-group>
      <b-form-group v-if="this.onetimepasscode === false" :label="sentences.login.password + ':'" label-for="password">
        <b-form-input id="password" type="password" v-model="password" required></b-form-input>
      </b-form-group>
      <b-form-group v-else :label="this.sentences.login.passcode + ':'" label-for="passcode">
        <b-form-input id="passcode" type="password" v-model="passcode" required></b-form-input>
      </b-form-group>
       <b-form-checkbox-group v-model="keep">
          <b-form-checkbox>{{sentences.login.keep}}</b-form-checkbox>
        </b-form-checkbox-group>
      <br />
      <span v-if="this.onetimepasscode === false" class='link' @click="this.enableOnetimepasscodeMode">{{this.sentences.login.onetimepasscode}}</span>
      <span v-else class='link' @click="this.enablePasswordMode">{{this.sentences.login.passwordmode}}</span>
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
          <b-button type="submit" variant="primary">{{sentences.login.signin}}</b-button>
          <b-button type="button" variant="secondary" @click.prevent="clear">{{sentences.login.clear}}</b-button>
          <b-button type="button" variant="danger" @click.prevent="hide">{{sentences.login.close}}</b-button>
        </p>
        <p class='text-right'>
          <b-button v-if="this.onetimepasscode === true && this.requestPasscodeCountdown === 0" type="button" @click.prevent="requestPasscode" variant="primary">{{sentences.login.request_passcode}}</b-button>
          <b-button v-if="this.onetimepasscode === true && this.requestPasscodeCountdown !== 0" :disabled="true" type="button" variant="primary">{{sentences.login.request_passcode}} ({{this.requestPasscodeCountdown}})</b-button>
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
    'language',
    'language_code',
    'loading',
    'sentences'
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
      items: { tid: -1, loading: true, elements: [] }
    }
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
          this.loginAnswer = this.sentences.login.requested_passcode
          this.dismissCountDown = this.dismissSecs
          break
        case 'login_password':
          if (obj.error !== false) {
            switch (obj.error) {
              case 404:
                this.loginAnswer = this.sentences.login.e404
                break
            }
          } else {
            this.loginAnswer = this.sentences.login.success
            this.success = true
            localStorage.removeItem('ltoken')
            sessionStorage.removeItem('ltoken')
            if (obj.content.keep === true) {
              localStorage.setItem('ltoken', obj.content.ltoken)
              this.$emit('sendonly', { method: 'token', options: { f: 'reauth' } })
            } else {
              sessionStorage.setItem('ltoken', obj.content.ltoken)
            }
            this.$emit('setltoken', obj.content.ltoken)
          }
          this.dismissCountDown = this.dismissSecs
          break
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
