<template>
  <div class='loading text-center align-top'>
    <font-awesome-icon v-if="!loading" icon="spinner" />
    <font-awesome-icon v-else icon="spinner" spin />
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
* {
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -o-user-select:none;
  user-select:none;
}
div.loading {
  position: fixed;
  width: 100vw;
  z-index: 40000;
}
</style>
