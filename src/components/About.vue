<template>
  <div v-if="this.sentences !== null && this.sentences.about !== undefined">
    <h2>{{this.title[this.language_code]}}</h2>
    <div class='container text-center text-md-left pt-5 mt-5'>
      <p>{{this.sentences.about.about_description_1}}</p>
      <br />
      <p>{{this.sentences.about.about_description_2}}</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
    }
  },
  props: [
    'language_code',
    'language',
    'title',
    'sentences'
  ],
  methods: {
    storno (obj) {
      this.$emit('setloading', false)
    }
  },
  watch: {
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
