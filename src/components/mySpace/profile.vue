<template>
  <!-- <v-hover v-slot="{ isHovering, props }"> -->
  <!-- <v-img
      width="100%"
      height="60vh"
      cover
      :class="{ 'on-hover': isHovering }"
      :src="user.background_url"
      v-bind="props"
    > -->
  <v-card height="35vh"> </v-card>
  <!-- <v-img
      width="100%"
      height="60vh"
      cover
      :src="user.background_url"
      v-bind="props"
    > -->
  <!-- <div class="d-flex justify-end">
        <v-btn
          variant="text"
          :class="{ 'show-btns': isHovering }"
          color="rgba(255, 255, 255, 0)"
          icon="mdi-image-edit"
          v-if="canEdit"
        ></v-btn>
      </div> -->
  <!-- </v-img> -->
  <!-- </v-hover> -->
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
          :size="150"
          style="border: 3px solid #fff; border-radius: 100%"
          v-bind="props"
        >
          <Avatar :name="user.username" variant="beam" :size="150" />
          <!-- <v-img cover :src="user.profile_url" class="d-flex align-center"> -->
          <!-- <v-btn
              variant="text"
              :class="{ 'show-btns': isHovering }"
              color="rgba(255, 255, 255, 0)"
              icon="mdi-camera"
              v-if="canEdit"
              @click="() => (showUploadProfile = !showUploadProfile)"
            ></v-btn> -->
          <!-- </v-img> -->
        </v-avatar>
      </v-hover>
      <v-card-title
        >@{{ user.username }}
        <v-icon
          v-if="user.isVerified"
          class="ms-2"
          icon="mdi-marker-check"
          size="s"
        ></v-icon>
      </v-card-title>
      <v-card-subtitle>{{ user.truncated_address }}</v-card-subtitle>
      <v-card-subtitle>{{ user.description }}</v-card-subtitle>
    </v-col>
    <v-col md="6" cols="12">
      <v-row class="mt-4 text-center">
        <v-col cols="4">
          <v-card-text class="text-h5">{{ user.owned_nfts_count }}</v-card-text>
          <v-card-subtitle>Owned NFTs</v-card-subtitle>
        </v-col>
        <v-col cols="4">
          <v-card-text class="text-h5">{{ user.followers_count }}</v-card-text>
          <v-card-subtitle>Followers</v-card-subtitle>
        </v-col>
        <v-col cols="4">
          <v-card-text class="text-h5">{{ user.followings_count }}</v-card-text>
          <v-card-subtitle>Following</v-card-subtitle>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      class="d-flex justify-center flex-column align-center"
      lg="2"
      md="2"
      cols="12"
    >
      <v-btn
        class="mx-2"
        variant="outlined"
        v-if="canEdit && !user.isVerified"
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
        :text="followBtnText"
        @click="follow(user.address)"
        v-else-if="canFollow"
      >
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
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import User from "@/models/user";
import EditProfile from "@/components/mySpace/editProfile.vue";
import changeProfilePic from "@/components/mySpace/changeProfilePic.vue";
import { useApiStore } from "@/stores/api";
import { useMarketStore } from "@/stores/market";
import Avatar from "vue-boring-avatars";

export default {
  name: "Profile",
  components: {
    Avatar,
    EditProfile,
    changeProfilePic,
  },
  props: ["userAddress"],
  emits: ["onAlert"],
  setup(props, { emit }) {
    const router = useRoute();
    const user = ref(new User({ username: "User Not Found" }));
    const showEditProfile = ref(false);
    const currentUser = sessionStorage.getItem("address");
    var userAddress = props.userAddress;
    // const showUploadProfile = ref(false);
    const canEdit = ref(false);
    const canFollow = ref(true);
    const followBtnText = ref("FOLLOW");
    const { getOwnedNFTsCount } = useMarketStore();
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
        if (res.status === 200) {
          alert.value = {
            show: true,
            color: "success",
            icon: "$success",
            title: "Success",
            text: "A verification code has been sent to your email.",
          };
          window.location.href = "/user/verify";
        } else {
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
      emit("onAlert", alert.value);
    };

    const follow = async (target_address) => {
      try {
        const res = await put("/api/user/follow", {
          user_address: currentUser,
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
          user_address: currentUser,
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
      user.value.updateUser(newDetail.username, newDetail.description);
    };

    // onMounted async because it take time for the parent component to fetch data
    onMounted(async () => {
      if (!userAddress || userAddress === "") {
        userAddress = currentUser;
      }

      try {
        const res = await get("/api/user/" + userAddress);
        if (res.status === 200) {
          user.value = User.fromJson(res.data);
          canEdit.value = user.value.isOwner(currentUser);
        }
      } catch (error) {
        console.error(error);
      }

      if (!canEdit.value) {
        if (user.value.isFollowing(currentUser)) {
          followBtnText.value = "FOLLOW BACK";
        }

        try {
          console.log("session", currentUser);
          const res = await post("/api/user/follow/check", {
            user_address: currentUser,
            target_address: router.params.address,
          });
          if (res.data === true) {
            canFollow.value = false;
          }
        } catch (err) {
          console.log(err);
          console.log(err.response.data.message);
        }
      }

      try {
        var owned_nfts_count = await getOwnedNFTsCount(user.value.address);
        user.value.setOwnedNftCount(owned_nfts_count);
      } catch (error) {
        console.error(error);
      }
    });

    return {
      user,
      showEditProfile,
      // showUploadProfile,
      canEdit,
      canFollow,
      getVerified,
      followBtnText,
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
