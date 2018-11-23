<template>
  <div>
    <h2>{{title}}</h2>
    <p>{{s.description}}</p>
    <div class='container text-center text-md-left position-relative'>
      <b-form @submit="onSubmit">
        <b-input-group>
          <b-form-input v-model="original_url" :placeholder="s.type_url"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-success" :disabled="!online || this.original_url === ''" type="submit">{{s.short}}</b-button>
            <b-button v-if="this.original_url === ''" variant="outline-secondary" :disabled="true">
              <font-awesome-icon :icon="['fas', 'trash']" />
            </b-button>
            <b-button v-else variant="outline-secondary" v-on:click.prevent="clear" v-b-tooltip="s.clear_tooltip">
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
          <p>{{s.invaliddomain}}</p>
        </b-alert>
      </div>
    </div>
    <br /><br />
    <div class='container text-center text-md-left position-relative'>
      <b-input-group>
        <b-form-input v-model="shorten_url" :placeholder="s.short_url" :readonly="true" :disabled="this.shorten_url === ''"></b-form-input>
        <b-input-group-append>
          <b-button variant="outline-primary" v-if="this.shorten_url === ''" :disabled="true">
            <font-awesome-icon :icon="['fas', 'copy']" />
          </b-button>
          <b-button variant="outline-primary" v-else v-clipboard="() => this.shorten_url" v-clipboard:success="clipboardSuccessHandler"  v-b-tooltip="s.copy_tooltip">
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
          <p>{{s.copied}}</p>
        </b-alert>
      </div>
    </div>
    <br /><br />
    <div class='container text-center text-md-left'>
      <p>{{s.description_1}}</p>
      <br />
      <p>{{s.description_2}}</p>
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
      sentences: [
        {
          alias: 'en-us',
          content:
          {
            clear_tooltip: 'clears all',
            copy_tooltip: 'copy short url to clipboard',
            type_url: 'type url here',
            shorten: 'Light URL Shortener',
            url: 'URL',
            short_url: 'Short URL',
            short: 'Shorten URL',
            description: 'simplify your links and share them easily',
            copied: 'link copied',
            invaliddomain: 'host/domain not found',
            description_1: 'The service has been started on November 19th, 2018 and it is totally free of charge with no ads and no tracking, as it should be provided forever',
            description_2: 'Suggestions are welcome, please use the e-mail in the footer of the page. New features will continue to be implemented'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            clear_tooltip: 'limpar tudo',
            copy_tooltip: 'copia url simplificada para área de transferência',
            type_url: 'digite aqui a url',
            shorten: 'Light URL Shortener',
            url: 'URL',
            short_url: 'URL Simplificada',
            short: 'Simplificar URL',
            description: 'simplifique seus links e os compartilhe mais facilmente',
            copied: 'link copiado',
            invaliddomain: 'host/dominio não encontrado',
            description_1: 'Este serviço foi iniciado em 19 de novembro de 2018 e é totalmente gratuito, livre de anúncios e rastreios, como deve permenecer para sempre',
            description_2: 'Sugestões são bem-vindas!! Utilize o e-mail que está no rodapé da página para fazê-las. Novas facilidades continuarão a ser implementadas'
          }
        }
      ],
      s: {
      },
      items: { tid: -1, loading: true, elements: [] }
    }
  },
  props: [
    'title',
    'token',
    'loading',
    'online',
    'language'
  ],
  mounted () {
    document.title = this.title
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
    },
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
div.control {
  display: inline-block;
  width: 100ch;
  max-width: 96vw;
}
div.box {
  width: 100vw;
}
</style>
