<template>
  <div>
    <h2 v-if="this.user !== null" >{{sentences.profile.profile}}: {{this.user.username}}</h2>
    <br />
    <b-container v-if="this.user !== null">
      <b-row>
        <b-col md="6" class="text-right">
          {{this.sentences.profile.username}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.username}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.sentences.profile.email}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.email}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.sentences.profile.firstname}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.firstname}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.sentences.profile.lastname}} :
        </b-col>
        <b-col md="6" class="text-left">
          {{this.user.lastname}}
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" class="text-right">
          {{this.sentences.profile.items_per_page}} :
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
      items: { tid: -1, elements: [] }
    }
  },
  props: [
    'title',
    'language',
    'language_code',
    'user',
    'sentences'
  ],
  methods: {
    storno (obj) {
      this.$emit('setloading', false)
    }
  },
  watch: {
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
