<template>
  <v-container fluid v-if="userExist">
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
      <profile :userAddress="userAddress" @onAlert="newAlert" />
      <v-tabs class="mt-10" v-model="tab" align-tabs="left">
        <v-tab :value="1">Owned</v-tab>
        <v-tab :value="2">On Sale</v-tab>
        <!-- <v-tab :value="3">Activity</v-tab> -->
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item :value="1">
          <OwnedNFT :userAddress="userAddress" />
        </v-window-item>
        <v-window-item :value="2">
          <OnSale :userAddress="userAddress" />
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
import Profile from "@/components/mySpace/profile.vue";
import OwnedNFT from "@/components/mySpace/ownedNFT.vue";
import OnSale from "@/components/mySpace/onSale.vue";
// import Activity from "@/components/mySpace/activity.vue";
import { useApiStore } from "@/stores/api";
import ConsoleUtils from "@/utils/consoleUtils";

export default {
  name: "MySpace",
  components: {
    Profile,
    OwnedNFT,
    OnSale,
    // Activity,
  },
  setup(prop) {
    const tab = ref(1);
    const route = useRoute();
    const userExist = ref(true);
    const userAddress =
      route.params.address ?? sessionStorage.getItem("address");
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
        const res = await getUser(userAddress);
        if (res) {
          userExist.value = true;
        } else {
          userExist.value = false;
        }
      } catch (error) {
        ConsoleUtils.displayError(error);
      }
    });

    return {
      alert,
      tab,
      userExist,
      userAddress,
      newAlert,
    };
  },
};
</script>
