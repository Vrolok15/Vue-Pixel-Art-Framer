<template>
  <TheHeader />
  <main>
    <PixelCanvas />
  </main>
</template>

<script>
import TheHeader from './components/TheHeader.vue'
import PixelCanvas from './components/PixelCanvas.vue'

export default {
  name: 'App',
  components: {
    TheHeader,
    PixelCanvas
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  width: 100%;
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding-top: 60px; /* Account for fixed header */
  box-sizing: border-box;
  position: absolute; /* Ensure it takes full width */
  left: 0;
  right: 0;
}
</style>
