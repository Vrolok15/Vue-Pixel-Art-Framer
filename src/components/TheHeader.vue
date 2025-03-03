<template>
  <header>
    <h1>Vue Pixel Art Framer</h1>
  </header>
</template>

<script>
export default {
  name: 'TheHeader'
}
</script>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  font-family: 'Silkscreen', cursive;
  background-color: var(--color-background);
  z-index: 100;
  height: 50px;
}

h1 {
  margin-top: 0;
}
</style> 