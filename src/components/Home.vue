<template>
  <div>
  <h2>{{s.shorten}}</h2>
  <p>{{s.description}}</p>
  <form action="#">
    <input type="text" v-model="original_url" :placeholder="s.url"><br />
    <input class='btn btn-dark' type="submit" v-on:click.prevent="short_url" :value='s.short' ><br />
    </form>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
      original_url: '',
      s: {
        shorten: 'Shorten URL',
        url: 'URL',
        shorten_url: 'Shorten URL',
        short: 'Shorten URL',
        description: 'A free service that makes your links shorten without any tracking and no ads'
      },
      items: { tid: -1, loading: true, elements: [] }
    }
  },
  props: [
    'title',
    'token',
    'loading'
  ],
  mounted () {
    document.title = this.title
  },
  methods: {
    short_url: function () {
      this.$emit('setloading', true)
      this.$emit('fetch', { method: 'shorten', storno: this.storno, context: this, sync: this.items, options: { f: 'join', id: this.original_url } })
      // this.$router.push('/shorten/?id=' + this.original_url)
    },
    storno (obj) {
      this.$emit('setloading', false)
      switch (obj.f) {
        case 'create':
          if (obj.error !== false) return
          this.$router.push('/shorten/?id=' + obj.id)
          break
      }
    }
  }
}
</script>

<style scoped>
</style>
