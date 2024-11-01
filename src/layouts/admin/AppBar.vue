<template>
  <v-app-bar color="black">
    <v-app-bar-title class="font-weight-black text-h5" @click="home()">
      <v-icon icon="mdi-alpha-e-box" size="50" />
      <span class="d-none d-sm-inline-block ms-3">Elysium</span>
      <span class="d-none d-sm-inline-block ms-3 text-accent">Admin</span>
    </v-app-bar-title>
    <v-btn class="me-2" large icon="mdi-bell"></v-btn>

    <v-btn
      class="me-2"
      large
      rounded
      color="white"
      variant="outlined"
      @click="login()"
      v-if="!isConnected"
    >
      Connect
    </v-btn>
    <v-menu v-else>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props">
          <v-avatar size="35">
            <Avatar :name="pfp_url" variant="beam" :size="35" />
            <!-- <v-img
              style="border: 2px solid #fff; border-radius: 100%"
              :src="pfp_url"
              alt="Profile Picture"
            /> -->
          </v-avatar>
        </v-btn>
      </template>

      <v-list bg-color="background">
        <v-list-item
          v-if="isAdmin"
          prepend-icon="mdi-view-dashboard"
          to="/admin/dashboard"
        >
          <v-list-item-title>Admin Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-for="(item, i) in menu"
          :key="i"
          :prepend-icon="item.icon"
          :to="item.link"
        >
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          base-color="red"
          prepend-icon="mdi-logout"
          @click="logout()"
        >
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMarketStore } from "@/stores/market.js";
import { storeToRefs } from "pinia";
import Avatar from "vue-boring-avatars";
import { UserRole } from "@/models/enums.js";

export default {
  name: "AppBar",
  components: {
    Avatar,
  },
  emits: ["onShowCart", "onSignUp"],
  setup(props, { emit }) {
    const marketStore = useMarketStore();
    const { account } = storeToRefs(marketStore);
    const isAdmin =
      sessionStorage.getItem("role") === UserRole.ADMIN ||
      sessionStorage.getItem("role") === UserRole.SUPER_ADMIN;
    const menu = [
      {
        text: "My Space",
        icon: "mdi-space-invaders",
        link: "/user/",
      },
      {
        text: "My Collection",
        icon: "mdi-cards",
        link: "/user/collection/",
      },
      {
        text: "Create NFT",
        icon: "mdi-pencil-ruler",
        link: "/create-nft",
      },
      // {
      //   text: "Manage Wallet",
      //   icon: "mdi-wallet",
      //   // link: "/wallet",
      // },
      // {
      //   text: "Setting",
      //   icon: "mdi-cog",
      //   // link: "/setting",
      // },
    ];

    const pfp_url = ref("");
    const isConnected = ref(false);
    const router = useRouter();

    onMounted(async () => {
      console.log(account.value);
      //check if user has logged in
      if (sessionStorage.getItem("pfp")) {
        pfp_url.value = sessionStorage.getItem("pfp");
        isConnected.value = true;
      }
      // if (window.ethereum) {
      //   login();
      // }
    });

    const home = () => {
      router.push("/admin/dashboard");
    };

    const login = async () => {
      try {
        await marketStore.connectWallet();
        var res = await marketStore.login(account.value);
        if (res.isSuccess) {
          pfp_url.value = sessionStorage.getItem("pfp");
          isConnected.value = true;
        } else if (res.isNotFound) {
          emit("onSignUp", true);
        }
      } catch (error) {
        console.log("Something went wrong...");
      }
    };

    const logout = () => {
      marketStore.logout();
      isConnected.value = false;
      router.push("/");
    };

    return {
      isAdmin,
      menu,
      isConnected,
      pfp_url,
      //function
      home,
      login,
      logout,
    };
  },
};
</script>
