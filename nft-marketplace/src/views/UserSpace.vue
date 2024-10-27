<template>
  <v-container
    class="d-flex justify-center align-center"
    style="height: 70vh"
    v-if="isLoading"
  >
    <v-responsive class="mx-auto" height="200px">
      <v-overlay
        v-model="isLoading"
        class="d-flex align-center justify-center"
        contained
        persistent
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="80"
          width="8"
        ></v-progress-circular>
      </v-overlay>
    </v-responsive>
  </v-container>
  <v-container fluid v-else-if="user">
    <v-alert
      class="mb-2"
      theme="dark"
      v-if="alert.show"
      :color="alert.color"
      :icon="alert.icon"
      :title="alert.title"
      :text="alert.text"
      variant="tonal"
      density="compact"
    ></v-alert>
    <v-card class="mx-auto" color="background">
      <profile :user="user" @onAlert="newAlert" />
      <v-tabs class="mt-10" v-model="tab" align-tabs="left">
        <v-tab :value="1">Owned</v-tab>
        <v-tab :value="2">On Sale</v-tab>
        <!-- <v-tab :value="3">Activity</v-tab> -->
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item :value="1">
          <nfts-container
            :view="NftsContainerView.VIEW_USER_OWNED"
            :address="user.address"
          />
        </v-window-item>
        <v-window-item :value="2">
          <nfts-container
            :view="NftsContainerView.VIEW_USER_LISTED"
            :address="user.address"
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
import { useRoute } from "vue-router";
import Profile from "@/components/userSpace/profile.vue";
import NftsContainer from "@/components/shared/NftsContainer.vue";
// import Activity from "@/components/userSpace/activity.vue";
import { useApiStore } from "@/stores/api";
import ConsoleUtils from "@/utils/consoleUtils";
import { NftsContainerView } from "@/models/enums";

export default {
  name: "User Space",
  components: {
    Profile,
    NftsContainer,
    // Activity,
  },
  setup() {
    const tab = ref(1);
    const route = useRoute();
    const isLoading = ref(true);
    const user = ref();

    const { getUser } = useApiStore();

    const alert = ref({
      show: false,
      color: "",
      icon: "",
      title: "",
      text: "",
    });

    const newAlert = (alertDetail) => {
      alert.value = alertDetail;
    };

    onMounted(async () => {
      try {
        let userAddress = null;
        if (!route.params.address || route.params.address === "") {
          userAddress = sessionStorage.getItem("address");
        } else {
          userAddress = route.params.address;
        }
        user.value = await getUser(userAddress);
      } catch (error) {
        ConsoleUtils.displayError(error);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      NftsContainerView,
      alert,
      tab,
      isLoading,
      user,
      newAlert,
    };
  },
};
</script>
