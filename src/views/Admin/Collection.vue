<template>
  <v-breadcrumbs :items="breadcrumbItems"></v-breadcrumbs>
  <v-card theme="dark" class="ma-4 pa-4" variant="outlined">
    <v-card-title class="ms-2">Manage Collections</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        single-line
      ></v-text-field
    ></v-card-text>
    <v-card-text>
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items-length="collections.length"
        :items="collections"
        :loading="loading"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn
            class="me-2"
            color="accent"
            variant="outlined"
            size="small"
            :to="'/collection/' + item.address"
          >
            View
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, onMounted } from "vue";
import { useApiStore } from "@/stores/api";
import { useMarketStore } from "@/stores/market";
import NftCollection from "@/models/nftCollection";
import ConsoleUtils from "@/utils/consoleUtils";

export default {
  setup() {
    const { getNftCollection } = useMarketStore();
    const { getAllCollections } = useApiStore();

    const breadcrumbItems = [
      {
        title: "Dashboard",
        disabled: false,
        to: "/admin/dashboard",
      },
      {
        title: "Manage Collections",
        disabled: true,
        to: "/admin/collection",
      },
    ];

    const itemsPerPage = ref(5);
    const loading = ref(true);
    const search = ref("");
    const headers = [
      { title: "Name", align: "start", key: "name" },
      { title: "Address", align: "start", key: "address" },
      { title: "Royalty (%)", align: "start", key: "royalty" },
      { title: "Royalty Recipient", align: "start", key: "royaltyRecipient" },
      { title: "Follower", align: "start", key: "follower" },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const collections = ref([]);

    onMounted(async () => {
      try {
        loading.value = true;
        const res = await getAllCollections();
        if (res) {
          collections.value = await Promise.all(
            res.map(async (i) => {
              try {
                const collection = await getNftCollection(i[0]);
                return new NftCollection({ ...collection, follower: i[1] });
              } catch (error) {
                ConsoleUtils.displayError(error);
              }
            })
          );
        }
        loading.value = false;
      } catch (error) {
        ConsoleUtils.displayError(error);
      }
    });

    return {
      breadcrumbItems,
      itemsPerPage,
      loading,
      search,
      headers,
      collections,
    };
  },
};
</script>
