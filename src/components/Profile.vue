<template>
  <div>
    <h2 v-if="this.user !== null" >{{s.profile}}: {{this.user.username}}</h2>
    <br />
    <b-container v-if="this.user !== null">
      <b-row>
        <b-col md="6" class="text-right">
          {{this.s.username}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.username}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.s.email}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.email}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.s.firstname}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.firstname}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.s.lastname}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.lastname}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.s.itemsperpage}} :
        </b-col>
        <b-col md="6" class="text-left">
          <b-form-select :options="page_options" v-model="user.attributes.items_per_page" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: 'profile',
  data () {
    return {
      page_options: [
        10,
        20,
        50
      ],
      sentences: [
        {
          alias: 'en-us',
          content:
          {

            clear_tooltip: 'clears all',
            email: 'email',
            firstname: 'first name',
            fullname: 'fullname',
            itemsperpage: 'items per page',
            lastname: 'last name',
            profile: 'Profile',
            username: 'username'
          }
        },
        {
          alias: 'pt-br',
          content:
          {
            clear_tooltip: 'limpar tudo',
            email: 'e-mail',
            firstname: 'primeiro nome',
            fullname: 'nome',
            itemsperpage: 'itens por página',
            lastname: 'sobrenome',
            profile: 'Perfil',
            username: 'nome do usuário'
          }
        }
      ],
      s: {
      },
      items: { tid: -1, elements: [] }
    }
  },
  props: [
    'title',
    'language',
    'user'
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
    storno (obj) {
      this.$emit('setloading', false)
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
    'user.attributes.items_per_page': function (newVal, oldVal) {
      if (oldVal === undefined || newVal === undefined) return
      if (newVal === oldVal) return
      this.user.attributes.itemsperpage = newVal
      this.$emit('fetch', { method: 'user', options: { f: 'set_attribute', attribute: 'items_per_page', value: newVal } })
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
