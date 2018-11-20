<template>
  <div>
    <h2>{{s.shorten}}</h2>
    <p>{{s.description}}</p>
    <div class='control'>
      <b-input-group :prepend="s.url">
        <b-form-input v-model="original_url"></b-form-input>
        <b-input-group-append>
          <b-btn variant="outline-success" v-on:click.prevent="short_url" :disabled="!online">{{s.short}}</b-btn>
        </b-input-group-append>
      </b-input-group>
    </div>
    <br /><br />
    <div class='control'>
      <b-input-group :prepend="s.shorten_url">
        <b-input-group-text slot="append">
            <icon class='pointer' v-if="this.shorten_url !== ''" name="clipboard" scale="1" v-clipboard="() => this.shorten_url" v-clipboard:success="clipboardSuccessHandler" />
            <icon v-else name="clipboard" scale="1" />
        </b-input-group-text>
        <b-form-input v-model="shorten_url" :readonly="true"></b-form-input>
      </b-input-group>
    </div>
    <br />
    <div class='control'>
      <b-alert :show="dismissCountDown"
             dismissible
             variant="info"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
        <p>{{s.copied}}</p>
      </b-alert>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
      dismissSecs: 1,
      dismissCountDown: 0,
      original_url: '',
      shorten_url: '',
      s: {
        shorten: 'Shorten URL',
        url: 'URL',
        shorten_url: 'Shorten URL',
        short: 'Shorten URL',
        description: 'A free service that makes your links shorten with no ads',
        copied: 'link copied'
      },
      items: { tid: -1, loading: true, elements: [] }
    }
  },
  props: [
    'title',
    'token',
    'loading',
    'online'
  ],
  mounted () {
    document.title = this.title
  },
  methods: {
    copy_url: function () {
      console.log('copying')
      if (this.shorten_url.trim() !== '') {
        this.showAlert()
        this.$clipboard(this.shorten_url)
      }
    },
    clipboardSuccessHandler: function () {
      this.showAlert()
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert () {
      this.dismissCountDown = this.dismissSecs
    },
    short_url: function () {
      this.$emit('setloading', true)
      this.shorten_url = ''
      this.$emit('fetch', { method: 'shorten', storno: this.storno, context: this, sync: this.items, options: { f: 'create', id: this.original_url } })
    },
    storno (obj) {
      this.$emit('setloading', false)
      this.shorten_url = obj.content.id
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
div.control {
  display: inline-block;
  width: 100ch;
  max-width: 96vw;
}
.pointer {
  cursor: pointer;
}
</style>
