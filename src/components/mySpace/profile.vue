<template>
  <v-hover v-slot="{ isHovering, props }">
    <!-- <v-img
      width="100%"
      height="60vh"
      cover
      :class="{ 'on-hover': isHovering }"
      :src="user.background_url"
      v-bind="props"
    > -->
    <v-img
      width="100%"
      height="60vh"
      cover
      :src="user.background_url"
      v-bind="props"
    >
      <!-- <div class="d-flex justify-end">
        <v-btn
          variant="text"
          :class="{ 'show-btns': isHovering }"
          color="rgba(255, 255, 255, 0)"
          icon="mdi-image-edit"
          v-if="canEdit"
        ></v-btn>
      </div> -->
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
            class="d-flex align-center"
          >
            <!-- <v-btn
              variant="text"
              :class="{ 'show-btns': isHovering }"
              color="rgba(255, 255, 255, 0)"
              icon="mdi-camera"
              v-if="canEdit"
              @click="() => (showUploadProfile = !showUploadProfile)"
            ></v-btn> -->
          </v-img>
        </v-avatar>
      </v-hover>
      <v-card-title>@{{ user.username }}
            <v-icon v-if="isVerified" class="ms-2" icon="mdi-marker-check" size="s"></v-icon>
      </v-card-title>
      <v-card-subtitle>{{ address }}</v-card-subtitle>
      <v-card-subtitle>{{ user.description }}</v-card-subtitle>
    </v-col>
    <v-col md="6" cols="12">
      <v-row class="mt-4 text-center">
        <v-col cols="4">
          <v-card-text class="text-h5">{{ owned_collections_count }}</v-card-text>
          <v-card-subtitle>Owned Collections</v-card-subtitle>
        </v-col>
        <v-col cols="4">
          <v-card-text class="text-h5">{{ followers_count }}</v-card-text>
          <v-card-subtitle>Followers</v-card-subtitle>
        </v-col>
        <v-col cols="4">
          <v-card-text class="text-h5">{{ followings_count }}</v-card-text>
          <v-card-subtitle>Following</v-card-subtitle>
        </v-col>
      </v-row>
    </v-col>
    <v-col class="d-flex justify-center  flex-column  align-center" lg="2" md="2" cols="12">
      <v-btn
        class="mx-2"
        variant="outlined"
        v-if="canEdit && !isVerified"
        @click="getVerified()"
      >
        Get Verified
      </v-btn>
      <v-btn
        class="mt-2"
        color="primary"
        variant="flat"
        v-if="canEdit"
        @click="() => (showEditProfile = !showEditProfile)"
      >
        Edit Profile
      </v-btn>
      <v-btn
        class="mx-2"
        color="white"
        @click="follow(user.address)"
        v-else-if="canFollow"
        >Follow
      </v-btn>
      <v-btn
        class="mx-2"
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
  <!-- <v-overlay
    v-model="showUploadProfile"
    location-strategy="connected"
    class="d-flex justify-center align-center"
  >
    <change-profile-pic
      v-if="showUploadProfile"
      @onEdit="() => (showUploadProfile = !showUploadProfile)"
    />
  </v-overlay> -->
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import EditProfile from "@/components/mySpace/editProfile.vue";
import changeProfilePic from "@/components/mySpace/changeProfilePic.vue";
import { useApiStore } from '@/stores/api';
import { useMarketStore } from "@/stores/market";

export default {
  name: "Profile",
  components: {
    EditProfile,
    changeProfilePic,
  },
  emits: ["onAlert"],
  setup(props, { emit }) {
    const router = useRoute();
    const user = ref({});
    const address = ref("");
    const isVerified = ref(false);
    const owned_collections_count = ref(0);
    const followers_count = ref(0);
    const followings_count = ref(0);
    const showEditProfile = ref(false);
    // const showUploadProfile = ref(false);
    const canFollow = ref(true);
    const { getMyCollection } = useMarketStore();
    const { get, post, put } = useApiStore();

    const alert = ref({
      show: false,
      color: "",
      icon: "",
      title: "",
      text: "",
    });


    const getVerified = async () => {
      try {
        var data = {
          email: user.value.email,
        };

        const res = await post("/api/auth/send-verification-email", data);
        if(res.status === 200) {
          alert.value = {
            show: true,
            color: "success",
            icon: "$success",
            title: "Success",
            text: "A verification code has been sent to your email.",
          };
          window.location.href = "/user/verify";
        } else{
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Error",
            text: res.data.message,
          };
        }
      } catch (err) {
        console.log(err);
        alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Error",
            text: err.response.data.message,
          };
      }
      emit('onAlert', alert.value);
    };

    const follow = async (target_address) => {
      try {
        const res = await put("/api/user/follow", {
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
        const res = await put("/api/user/unfollow", {
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
        const res = await get("/api/user/" + router.params.address);
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
        isVerified.value = user.value.verifiedAt != null;
        followers_count.value  = user.value.followers_count ?? 0;
        followings_count.value = user.value.following.length;
        owned_collections_count.value = (await getMyCollection()).length;
      } catch (error) {
        console.error(error);
      }

      try {
        console.log("session", sessionStorage.getItem("address"));
        const res = await post("/api/user/follow/check", {
          user_address: sessionStorage.getItem("address"),
          target_address: router.params.address,
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
      return router.params.address === sessionStorage.getItem("address");
    });

    return {
      user,
      address,
      isVerified,
      owned_collections_count,
      followers_count,
      followings_count,
      showEditProfile,
      // showUploadProfile,
      canEdit,
      canFollow,
      getVerified,
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
