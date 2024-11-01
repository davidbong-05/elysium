<template>
  <div class="font-weight-bold text-h4 ms-4 mt-4">All Users</div>
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
        :items-length="users.length"
        :items="users"
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
            :to="item.link"
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
import { useApiStore } from "@/stores/api.js";
export default {
  setup() {
    const { getUsers } = useApiStore();
    const itemsPerPage = ref(5);
    const loading = ref(true);
    const search = ref("");
    const headers = [
      { title: "Name", align: "start", key: "username" },
      { title: "Address", align: "start", key: "address" },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const users = ref([]);

    onMounted(async () => {
      try {
        users.value = await getUsers();
        loading.value = false;
      } catch (error) {
        console.error(error);
      }
    });

    return {
      itemsPerPage,
      loading,
      search,
      headers,
      users,
    };
  },
};
</script>
