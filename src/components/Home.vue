<template>
  <div>
    <h2>{{this.title[this.language_code]}}</h2>
    <p>{{this.sentences.home.description}}</p>
    <div class='container text-center text-md-left position-relative pt-5 mt-5'>
      <b-form @submit="onSubmit">
        <b-input-group>
          <b-form-input v-model="original_url" :placeholder="this.sentences.home.type_url"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-success" :disabled="!online || this.original_url.length < 4" type="submit">{{this.sentences.home.short}}</b-button>
            <b-button v-if="this.original_url === ''" variant="outline-secondary" :disabled="true">
              <font-awesome-icon :icon="['fas', 'trash']" />
            </b-button>
            <b-button v-else variant="outline-secondary" v-on:click.prevent="clear" v-b-tooltip="this.sentences.home.clear_tooltip">
              <font-awesome-icon :icon="['fas', 'trash']" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>
    </div>
    <div class='position-absolute text-center w-100' style='color: #ff0000;'>
      <div class='d-inline-block'>
        <b-alert :show="NotFoundDismissCountDown"
               fade
               variant="transparent"
               @dismissed="NotFoundDismissCountDown=0"
               @dismiss-count-down="NotFoundCountDownChanged">
          <p>{{this.sentences.home.invaliddomain}}</p>
        </b-alert>
      </div>
    </div>
    <br /><br />
    <div class='container text-center text-md-left position-relative'>
      <b-input-group>
        <b-form-input v-model="shorten_url" :placeholder="this.sentences.home.short_url" :readonly="true" :disabled="this.shorten_url === ''"></b-form-input>
        <b-input-group-append>
          <b-button variant="outline-primary" v-if="this.shorten_url === ''" :disabled="true">
            <font-awesome-icon :icon="['fas', 'copy']" />
          </b-button>
          <b-button variant="outline-primary" v-else v-clipboard="() => this.shorten_url" v-clipboard:success="clipboardSuccessHandler"  v-b-tooltip="this.sentences.home.copy_tooltip">
            <font-awesome-icon :icon="['fas', 'copy']" />
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
    <div class='position-absolute text-center w-100'>
      <div class='d-inline-block'>
        <b-alert :show="dismissCountDown"
               fade
               variant="transparent"
               @dismissed="dismissCountDown=0"
               @dismiss-count-down="countDownChanged">
          <p>{{this.sentences.home.copied}}</p>
        </b-alert>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
      dismissSecs: 3,
      dismissCountDown: 0,
      NotFoundDismissCountDown: 0,
      original_url: '',
      shorten_url: '',
      items: { tid: -1, loading: true, elements: [] }
    }
  },
  props: [
    'title',
    'loading',
    'online',
    'language',
    'language_code',
    'sentences'
  ],
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      this.short_url()
    },
    clear: function () {
      this.original_url = ''
    },
    clipboardSuccessHandler: function () {
      this.dismissCountDown = this.dismissSecs
    },
    NotFoundCountDownChanged (dismissCountDown) {
      this.NotFoundDismissCountDown = dismissCountDown
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    short_url: function () {
      this.$emit('setloading', true)
      this.shorten_url = ''
      this.dismissCountDown = 0
      this.NotFoundDismissCountDown = 0
      this.$emit('fetch', { method: 'shorten', storno: this.storno, context: this, sync: this.items, options: { f: 'create', id: this.original_url } })
    },
    storno (obj) {
      this.$emit('setloading', false)
      if (obj.error === false) {
        this.shorten_url = obj.content.id
        return
      }
      switch (obj.error) {
        case 404:
          this.NotFoundDismissCountDown = this.dismissSecs
          break
      }
    }
  },
  watch: {
    original_url: function (val, oldVal) {
      this.shorten_url = ''
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
div.control {
  display: inline-block;
  width: 100ch;
  max-width: 96vw;
}
div.box {
  width: 100vw;
}
</style>
