<template>
  <div v-if="isExist">
    <div class="mt-4 d-flex align-center">
      <div class="font-weight-bold text-h4 mr-4">Top Collection</div>
      <v-btn color="primary" size="small" to="collections"> View All </v-btn>
    </div>
    <v-row class="mt-5" v-if="isLoading || collections.length">
      <v-col cols="12" md="4" v-for="item in collections" :key="item.address">
        <v-card class="mx-auto" max-width="344" color="black">
          <v-img :src="item.cover" height="200px"></v-img>
          <v-card-title class="text-h5">{{ item.name }}</v-card-title>
          <v-card-text>{{ item.address }}</v-card-text>
          <v-card-actions class="d-flex justify-space-between mx-2">
            <v-btn variant="outlined">{{ item.follower }} Followers</v-btn>
            <v-btn class="w-50" variant="outlined" :to="item.link">View</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" v-if="isLoading">
        <v-skeleton-loader
          class="mx-auto"
          :loading="isLoading"
          type="card,  list-item-two-line, actions"
          width="344"
          height="350"
          theme="dark"
        ></v-skeleton-loader>
      </v-col>
      <v-col cols="12" md="4" v-if="isLoading">
        <v-skeleton-loader
          class="mx-auto"
          :loading="isLoading"
          type="card,  list-item-two-line, actions"
          width="344"
          height="350"
          theme="dark"
        ></v-skeleton-loader>
      </v-col>
      <v-col cols="12" md="4" v-if="isLoading">
        <v-skeleton-loader
          class="mx-auto"
          :loading="isLoading"
          type="card,  list-item-two-line, actions"
          width="344"
          height="350"
          theme="dark"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useMarketStore } from "@/stores/market";
import ConsoleUtils from "@/utils/consoleUtils";

export default {
  name: "TopCollection",
  setup() {
    const isExist = ref(true);
    const isLoading = ref(true);
    const { getTopNftCollections } = useMarketStore();
    const collections = ref([]);

    onMounted(async () => {
      try {
        const topCollections = await getTopNftCollections();
        if (topCollections.length > 0) {
          collections.value = topCollections;
        } else {
          isExist.value = false;
        }
        isLoading.value = false;
      } catch (err) {
        ConsoleUtils.displayError(err);
      }
    });

    return {
      isExist,
      isLoading,
      collections,
    };
  },
};
</script>
