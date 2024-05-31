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
            <v-img
              style="border: 2px solid #fff; border-radius: 100%"
              :src="pfp_url"
              alt="Profile Picture"
            />
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
import { useApiStore } from '@/stores/api';
import { useMarketStore } from "@/stores/market";
import { storeToRefs } from "pinia";

export default {
  name: "AppBar",
  emits: ["onShowCart", "onSignUp"],
  setup(props, { emit }) {
    const marketStore = useMarketStore();
    const { account } = storeToRefs(marketStore);
    const isAdmin = sessionStorage.getItem("role") === "admin" || sessionStorage.getItem("role") === "superadmin";
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

        var status = await marketStore.login(account.value);
        //check if user previously signed up
        if(status == 200) {
          pfp_url.value = sessionStorage.getItem("pfp");
          isConnected.value = true;
        }
      } catch (error) {
        if (error.response?.status == 404) {
            emit("onSignUp", true);
        }
        else {
          console.log("Server error please try again later...");
        }
        console.log(error);
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
