<template>
  <router-view />
</template>

<script>
import { useMarketStore } from '@/stores/market';

export default
{
  setup()
  {
    const { ping } = useMarketStore();

    window.onbeforeunload  = (event) => {
      //TODO: find a proper way to log out when user close all instance of tabs
      ping();
    }

    return {}
  }
}
</script>
