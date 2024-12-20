<template>
  <div class="app">
    <app-header />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'

export default {
  name: 'App',
  components: {
    AppHeader
  }
}
</script>

<style>
:root {
  --primary-color: #2C5697; /* eMOTIONAL Cities blue */
  --secondary-color: #00B1B0; /* eMOTIONAL Cities teal */
  --accent-color: #FFB81C; /* eMOTIONAL Cities yellow */
  --text-color: #333333;
  --light-gray: #F5F5F5;
  --border-color: #E0E0E0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--light-gray);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: var(--light-gray);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary-color);
  font-weight: 600;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
  font-family: inherit;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
