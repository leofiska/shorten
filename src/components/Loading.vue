<template>
  <div class="loading">
    <icon name="sync" v-if="!loading" scale="1" />
    <icon name="sync" spin v-else scale="1" />
  </div>
</template>
<script>
export default {
  name: 'loading',
  props: [
    'loading'
  ]
}
</script>

<style scoped>
div.loading {
  position: absolute;
  top: 0rem;
  left: 0;
  right: 0;
  display: inline-block;
}
</style>
