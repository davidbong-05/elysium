<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-img
      width="100%"
      height="60vh"
      cover
      :class="{ 'on-hover': isHovering }"
      :src="user.background_url"
      v-bind="props"
    >
      <div class="d-flex justify-end">
        <v-btn
          variant="text"
          :class="{ 'show-btns': isHovering }"
          color="rgba(255, 255, 255, 0)"
          icon="mdi-image-edit"
          v-if="canEdit"
        ></v-btn>
      </div>
    </v-img>
  </v-hover>
  <v-row>
    <v-col
      class="text-center"
      md="4"
      cols="12"
      style="position: relative; top: -5em; max-height: 150px"
    >
      <v-hover v-slot="{ isHovering, props }">
        <v-avatar
          class="mb-0 rounded-circle"
          color="grey"
          size="150"
          style="border: 3px solid #fff; border-radius: 100%"
          v-bind="props"
        >
          <v-img
            cover
            :src="user.profile_url"
            :class="{ 'on-hover': isHovering }"
            class="d-flex align-center"
          >
            <v-btn
              variant="text"
              :class="{ 'show-btns': isHovering }"
              color="rgba(255, 255, 255, 0)"
              icon="mdi-camera"
              v-if="canEdit"
              @click="() => (showUploadProfile = !showUploadProfile)"
            ></v-btn>
          </v-img>
        </v-avatar>
      </v-hover>
      <v-card-title>@{{ user.username }}</v-card-title>
      <v-card-subtitle>{{ address }}</v-card-subtitle>
    </v-col>
    <v-col md="6" cols="12">
      <v-row class="mt-4 text-center">
        <v-col cols="4">
          <v-card-text class="text-h5">{{ ownedQty }}</v-card-text>
          <v-card-subtitle>Owned NFTs</v-card-subtitle>
        </v-col>
        <v-col cols="4">
          <v-card-text class="text-h5">{{ followers }}</v-card-text>
          <v-card-subtitle>Followers</v-card-subtitle>
        </v-col>
        <v-col cols="4">
          <v-card-text class="text-h5">{{ following }}</v-card-text>
          <v-card-subtitle>Following</v-card-subtitle>
        </v-col>
      </v-row>
    </v-col>
    <v-col class="d-flex justify-center align-center" lg="2" md="2" cols="12">
      <v-btn
        class="mx-2"
        width="80%"
        color="primary"
        variant="flat"
        v-if="canEdit"
        @click="() => (showEditProfile = !showEditProfile)"
      >
        Edit Profile
      </v-btn>
      <v-btn
        class="mx-2"
        width="80%"
        color="white"
        @click="follow(user.address)"
        v-else-if="canFollow"
        >Follow
      </v-btn>
      <v-btn
        class="mx-2"
        width="80%"
        variant="outlined"
        color="white"
        @click="unfollow(user.address)"
        v-else
        >Unfollow
      </v-btn>
    </v-col>
  </v-row>
  <v-overlay
    v-model="showEditProfile"
    location-strategy="connected"
    class="d-flex justify-center align-center"
  >
    <edit-profile
      :user="user"
      @update:user="updateUser"
      v-if="showEditProfile"
      @onEdit="() => (showEditProfile = !showEditProfile)"
    />
  </v-overlay>
  <v-overlay
    v-model="showUploadProfile"
    location-strategy="connected"
    class="d-flex justify-center align-center"
  >
    <change-profile-pic
      v-if="showUploadProfile"
      @onEdit="() => (showUploadProfile = !showUploadProfile)"
    />
  </v-overlay>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import EditProfile from "@/components/mySpace/editProfile.vue";
import changeProfilePic from "@/components/mySpace/changeProfilePic.vue";

export default {
  name: "Profile",
  components: {
    EditProfile,
    changeProfilePic,
  },
  setup() {
    const route = useRoute();
    const user = ref({});
    const address = ref("");
    const ownedQty = 5;
    const followers = 10;
    const following = 20;
    const showEditProfile = ref(false);
    const showUploadProfile = ref(false);
    const canFollow = ref(true);

    const follow = async (target_address) => {
      try {
        const res = await axios.put("/api/user/follow", {
          user_address: sessionStorage.getItem("address"),
          target_address: target_address,
        });
        console.log(res);
        canFollow.value = false;
      } catch (err) {
        console.log(err);
        console.log(err.response.message);
      }
    };

    const unfollow = async (target_address) => {
      try {
        const res = await axios.put("/api/user/unfollow", {
          user_address: sessionStorage.getItem("address"),
          target_address: target_address,
        });
        console.log(res);
        canFollow.value = true;
      } catch (err) {
        console.log(err);
        console.log(err.response.message);
      }
    };

    const updateUser = (newDetail) => {
      user.value.username= newDetail.username;
      user.value.description= newDetail.description;
    };

    // onMounted async because it take time for the parent component to fetch data
    onMounted(async () => {
      try {
        const res = await axios.get("/api/user/" + route.params.address);
        if (res.status === 200) {
          user.value = res.data;
          let original_address = res.data.address;
          let truncated_address1 = original_address.substring(0, 5);
          let truncated_address2 = original_address.substring(
            original_address.length - 4,
            original_address.length
          );
          address.value = truncated_address1 + "..." + truncated_address2;
        }
      } catch (error) {
        console.error(error);
      }

      try {
        console.log("session", sessionStorage.getItem("address"));
        const res = await axios.post("/api/user/follow/check", {
          user_address: sessionStorage.getItem("address"),
          target_address: route.params.address,
        });
        if (res.data === true) {
          canFollow.value = false;
        }
      } catch (err) {
        console.log(err);
        console.log(err.response.data.message);
      }
    });

    const canEdit = computed(() => {
      return route.params.address === sessionStorage.getItem("address");
    });

    return {
      user,
      address,
      ownedQty,
      followers,
      following,
      showEditProfile,
      showUploadProfile,
      canEdit,
      canFollow,
      follow,
      unfollow,
      updateUser,
    };
  },
};
</script>
<style scoped>
.on-hover {
  opacity: 0.6;
}

.show-btns {
  color: rgba(255, 255, 255, 1) !important;
}
</style>
