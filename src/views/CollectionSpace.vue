<template>
  <v-container fluid v-if="collectionExist">
    <v-card class="mx-auto" variant="outlined" theme="dark">
      <div class="pa-8">
        <v-card-title class="text-h3 my-2">
          {{ collectionDetails.name }}
        </v-card-title>
        <v-card-subtitle>{{ collectionDetails.address }}</v-card-subtitle>
        <v-card-text>Royalty: {{ collectionDetails.royalty }}%</v-card-text>
        <v-card-text
          >Royalty Recipient:
          {{ collectionDetails.royaltyRecipientName }}</v-card-text
        >
        <v-card-text> Royalty Recipient Address: </v-card-text>
        <v-card-subtitle>
          {{ collectionDetails.royaltyRecipient }}
        </v-card-subtitle>
      </div>
      <v-tabs class="mt-10" v-model="tab" align-tabs="left">
        <v-tab :value="1">All</v-tab>
        <v-tab :value="2">On Sale</v-tab>
        <!-- <v-tab :value="3">Activity</v-tab> -->
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item :value="1">
          <nfts-container
            v-if="collectionAddress"
            :view="NftsContainerView.VIEW_COLLECTION_ALL"
            :address="collectionAddress"
          />
        </v-window-item>
        <v-window-item :value="2">
          <nfts-container
            v-if="collectionAddress"
            :view="NftsContainerView.VIEW_COLLECTION_LISTED"
            :address="collectionAddress"
          />
        </v-window-item>
        <!-- <v-window-item :value="3">
          <Activity />
        </v-window-item> -->
      </v-window>
    </v-card>
  </v-container>
  <v-container
    class="d-flex justify-center align-center"
    style="height: 70vh"
    v-else
  >
    <v-card class="mx-auto" color="background">
      <v-card-title class="text-h4">User not found</v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import { ref, onMounted } from "vue";
import { useMarketStore } from "@/stores/market";
import { useRoute } from "vue-router";
import NftsContainer from "@/components/shared/NftsContainer.vue";
import { NftsContainerView } from "@/models/enums";

// import Activity from "@/components/collectionPage/activity.vue";

export default {
  name: "Collection Space",
  components: {
    NftsContainer,
    // Activity,
  },
  setup() {
    const { getNftCollection } = useMarketStore();
    const tab = ref(1);
    const route = useRoute();
    const collectionAddress = route.params.address;
    const collectionExist = ref(true);
    const collectionDetails = ref({});

    onMounted(async () => {
      try {
        collectionDetails.value = await getNftCollection(collectionAddress);
      } catch (error) {
        console.error(error);
      }
    });

    return {
      NftsContainerView,
      tab,
      collectionExist,
      collectionAddress,
      collectionDetails,
    };
  },
};
</script>
