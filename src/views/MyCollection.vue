<template>
  <v-container>
    <v-alert
      v-if="alert.show"
      class="my-3 mx-6"
      theme="dark"
      :color="alert.color"
      :icon="alert.icon"
      :title="alert.title"
      :text="alert.text"
      variant="tonal"
      density="compact"
    ></v-alert>
    <v-card class="my-4" variant="outlined" theme="dark">
      <v-card-title>Linked Collection</v-card-title>
      <div v-if="!isLoading">
        <v-card-text v-if="linkedCollection.length > 0">
          <v-table fixed-header height="300px" theme="dark">
            <thead>
              <tr>
                <th scope="cName" class="text-left">Collection Name</th>
                <th scope="lcAddress" class="text-left">Collection Address</th>
                <th scope="action" class="text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in linkedCollection" :key="item">
                <td>{{ item.name }}</td>
                <td>{{ item.address }}</td>
                <td>
                  <v-btn
                    color="red"
                    variant="tonal"
                    prepend-icon="mdi-link-variant-off"
                    @click="unlink(item.address)"
                  >
                    Unlink
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-text v-else>
          <h3 class="mt-4">You don't have any linked collection yet</h3>
          <p class="mt-2">
            You can can add collection to the marketplace or create your own
            collection
          </p>
        </v-card-text>
        <v-card-actions>
          <v-text-field
            v-model="collectionAddress"
            label="Link Collection Address Manually"
            placeholder="eg. 0xd0E9D7b417ef22a23D0df40aDb09860269226E53"
            variant="outlined"
            density="compact"
            append-inner-icon="mdi-plus"
            @click:append-inner="link(collectionAddress)"
          ></v-text-field>
        </v-card-actions>
      </div>
      <v-responsive v-if="isLoading" class="mx-auto text-center" height="350px">
        <v-overlay
          v-model="isLoading"
          class="align-center justify-center"
          contained
          persistent
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="60"
            width="8"
          ></v-progress-circular>
          <h4 class="mt-3">
            {{ loadingMsg }}
          </h4>
        </v-overlay>
      </v-responsive>
    </v-card>

    <v-card variant="outlined" theme="dark">
      <v-card-title class="mt-4 d-flex justify-space-between"
        >Created Collection
        <v-btn
          prepend-icon="mdi-sync"
          color="white"
          variant="outlined"
          onhowe:
          @click="linkAll()"
        >
          Link All
        </v-btn></v-card-title
      >
      <div v-if="!isLoading">
        <v-card-text v-if="createdCollection.length > 0">
          <v-table fixed-header height="300px" theme="dark">
            <thead>
              <tr>
                <th scope="cName" class="text-left">Collection Name</th>
                <th scope="cAddress" class="text-left">Collection Address</th>
                <th scope="action" class="text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in createdCollection" :key="item">
                <td>{{ item.name }}</td>
                <td>{{ item.address }}</td>
                <td>
                  <v-btn
                    color="accent"
                    variant="tonal"
                    prepend-icon="mdi-link-variant"
                    @click="link(item.address)"
                  >
                    Link
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-text v-else>
          <h3 class="mt-4">You don't have any linked collection yet</h3>
          <p class="mt-2">
            You can can add collection to the marketplace or create your own
            collection
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="() => (showForm = !showForm)">
            Create New Collection
          </v-btn>
        </v-card-actions>
      </div>
      <v-responsive v-if="isLoading" class="mx-auto text-center" height="350px">
        <v-overlay
          v-model="isLoading"
          class="align-center justify-center"
          contained
          persistent
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="60"
            width="8"
          ></v-progress-circular>
          <h4 class="mt-3">
            {{ loadingMsg }}
          </h4>
        </v-overlay>
      </v-responsive>
    </v-card>
  </v-container>
  <v-overlay
    v-model="showForm"
    location-strategy="connected"
    class="d-flex justify-center align-center"
  >
    <create-collection
      v-if="showForm"
      @onShowForm="() => (showForm = !showForm)"
    />
  </v-overlay>
</template>

<script>
import { ref, onMounted } from "vue";
import { useMarketStore } from "@/stores/market.js";
import { useApiStore } from "@/stores/api.js";
import createCollection from "@/components/myCollection/createCollection.vue";
import Alert from "@/models/alert.js";

export default {
  name: "MyCollection",
  components: { createCollection },
  setup() {
    const { getMyCollection, getNftCollection } = useMarketStore();
    const { getLinkedCollections, putLinkCollection, putUnlinkCollection } =
      useApiStore();
    const isLoading = ref(true);
    const loadingMsg = ref(
      "Trying to fetch your NFTs collections. This may take a while..."
    );
    const alert = ref({});
    const showForm = ref(false);
    const linkedCollection = ref([]);
    const createdCollection = ref([]);
    const collectionAddress = ref("");
    const userAddress = sessionStorage.getItem("address");

    const loadLinkedCollection = async () => {
      try {
        let collections = [];
        const res = await getLinkedCollections(userAddress);
        for (const item of res) {
          let collection = await getNftCollection(item);
          if (collection != null) {
            collections.push(collection);
          }
        }
        linkedCollection.value = collections;
      } catch (err) {
        loadingMsg.value =
          "Oops... Something went wrong, please try again later...";
        console.log(err);
      }
    };

    const loadCreatedCollection = async () => {
      try {
        let collections = [];
        const res = await getMyCollection();
        for (const item of res) {
          let collection = await getNftCollection(item);
          if (collection != null) {
            collections.push(collection);
          }
        }
        createdCollection.value = collections;
      } catch (err) {
        loadingMsg.value =
          "Oops... Something went wrong, please try again later...";
        console.log(err);
      }
    };

    const linkAll = async () => {
      const createdCollectionAddresses = createdCollection.value.map(
        (collection) => collection.address
      );
      const linkedCollectionAddressSet = new Set(
        linkedCollection.value.map((collection) => collection.address)
      );
      const newCreatedCollectionAddresses = createdCollectionAddresses.filter(
        (addr) => !linkedCollectionAddressSet.has(addr)
      );
      newCreatedCollectionAddresses.forEach((address) => {
        link(address);
      });
    };

    const link = async (address) => {
      loadingMsg.value =
        "Trying to update your NFTs collections. This may take a while...";
      isLoading.value = true;
      let collection = await getNftCollection(address);
      if (!collection) {
        alert.value.setError("Collection doesn't exist.");
        isLoading.value = false;
        return;
      }
      const res = await putLinkCollection(
        userAddress,
        address,
        linkedCollection.value
      );
      if (res.isSuccess) {
        alert.value.setSuccess("Successfully linked.");
        linkedCollection.value.push(collection);
      } else {
        alert.value.setError(res.message);
      }
      isLoading.value = false;
    };

    const unlink = async (address) => {
      loadingMsg.value =
        "Trying to update your NFTs collections. This may take a while...";
      isLoading.value = true;
      const res = await putUnlinkCollection(
        userAddress,
        address,
        linkedCollection.value
      );
      if (res.isSuccess) {
        alert.value.setSuccess("Successfully unlinked.");
        linkedCollection.value = linkedCollection.value.filter(
          (linkedCollection) => linkedCollection.address !== address
        );
      } else {
        alert.value.setError(res.message);
      }
      isLoading.value = false;
    };

    onMounted(async () => {
      alert.value = new Alert();
      loadingMsg.value =
        "Trying to fetch your NFTs collections. This may take a while...";
      await loadLinkedCollection();
      await loadCreatedCollection();

      isLoading.value = false;
    });

    return {
      alert,
      isLoading,
      loadingMsg,
      showForm,
      linkedCollection,
      createdCollection,
      collectionAddress,
      linkAll,
      link,
      unlink,
    };
  },
};
</script>
