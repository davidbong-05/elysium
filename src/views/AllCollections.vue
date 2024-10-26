<template>
  <div class="font-weight-bold text-h4 ms-4 mt-4">All Collections</div>
  <v-card theme="dark" class="ma-4 pa-4" variant="outlined">
    <template v-slot:text>
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
    </template>
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
            color="primary"
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
import { useMarketStore } from "@/stores/market";
import ConsoleUtils from "@/utils/consoleUtils";

export default {
  setup() {
    const { getNftCollections } = useMarketStore();

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
      {
        title: "Royalty Recipient Name",
        align: "start",
        key: "royaltyRecipientName",
      },
      { title: "Follower", align: "start", key: "follower" },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const collections = ref([]);

    onMounted(async () => {
      try {
        loading.value = true;
        collections.value = await getNftCollections();
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
