<template>
  <div v-if="isExist">
    <div class="mt-4 d-flex align-center">
      <div class="font-weight-bold text-h4 mr-4">Top Collection</div>
      <v-btn color="primary" size="small" to="collections"> View All </v-btn>
    </div>
    <v-row class="mt-5" v-if="isLoading || topCollections.length">
      <v-col
        cols="12"
        md="4"
        v-for="item in topCollections"
        :key="item.address"
      >
        <v-card class="mx-auto" max-width="344" color="black">
          <v-img :src="item.cover" height="200px"></v-img>
          <v-card-title class="text-h5">{{ item.name }}</v-card-title>
          <v-card-text>{{ item.address }}</v-card-text>
          <v-card-actions class="d-flex justify-space-between mx-2">
            <v-btn variant="outlined">{{ item.counts }} Followers</v-btn>
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
import { useApiStore } from "@/stores/api";
import { useMarketStore } from "@/stores/market";
import ConsoleUtils from "@/utils/consoleUtils";

export default {
  name: "TopCollection",
  setup() {
    const isExist = ref(true);
    const isLoading = ref(true);
    const { getNftCollection } = useMarketStore();
    const topCollections = ref([]);
    const { get } = useApiStore();

    onMounted(async () => {
      try {
        const res = await get("/api/collection/topCollection");

        if (res.status === 200) {
          for (const item of res.data) {
            let collectionItem = await getNftCollection(item[0]);
            if (collectionItem == null || collectionItem.totalSupply == 0)
              continue;
            collectionItem.link = `/collection/${item[0]}`;
            collectionItem.counts = item[1];
            topCollections.value.push(collectionItem);
          }
        }
        isLoading.value = false;
      } catch (err) {
        if (err.response.status === 404)
          // TODO if no top collection, show something else
          isExist.value = false;
        ConsoleUtils.displayError(err);
      }
    });

    return {
      isExist,
      isLoading,
      topCollections,
    };
  },
};
</script>
