<template>
  <v-card theme="dark" width="35em" class="py-2 px-1">
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
    <div v-if="!isUpdate && !isLoading">
      <v-img height="194" :src="nft.tokenUri"></v-img>
      <v-card-title>{{ nft.name }}</v-card-title>
      <v-card-subtitle>{{ nft.desc }}</v-card-subtitle>
      <div v-if="nft.price">
        <v-card-text>Seller:</v-card-text>
        <v-card-subtitle> {{ nft.sellerName }}</v-card-subtitle>
        <v-card-subtitle> {{ nft.seller }}</v-card-subtitle>
      </div>
      <div v-else>
        <v-card-text>Owner:</v-card-text>
        <v-card-subtitle> {{ nft.ownerName }}</v-card-subtitle>
        <v-card-subtitle> {{ nft.owner }}</v-card-subtitle>
      </div>
      <div>
        <v-card-text>Collection:</v-card-text>
        <v-card-subtitle> {{ nft.collectionName }}</v-card-subtitle>
        <v-card-subtitle> {{ nft.collection }}</v-card-subtitle>
      </div>
      <div>
        <v-card-text>Creator:</v-card-text>
        <v-card-subtitle> {{ nft.collectionOwnerName }}</v-card-subtitle>
        <v-card-subtitle> {{ nft.collectionOwner }}</v-card-subtitle>
      </div>
      <v-card-text v-if="nft.price">{{ nft.price }} ETH</v-card-text>
      <v-card-text>Royalty: {{ nft.royalty }} %</v-card-text>
      <v-card-actions v-if="showForm">
        <v-text-field
          v-model="price"
          label="Price"
          variant="outlined"
          density="compact"
          suffix="ETH"
          type="number"
        ></v-text-field>
      </v-card-actions>
    </div>
    <v-responsive v-if="isLoading" class="mx-auto" height="200px">
      <v-overlay
        v-model="isLoading"
        class="d-flex align-center justify-center"
        contained
        persistent
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="60"
          width="8"
        ></v-progress-circular>
        <h3 class="ms-3 d-inline-block">Loading transaction...</h3>
      </v-overlay>
    </v-responsive>
    <transaction-detail-card
      v-if="transactionDetail"
      :transactionDetail="transactionDetail"
    />
    <v-card-actions class="d-flex justify-end">
      <v-btn
        v-if="isUpdate"
        class="me-2"
        color="primary"
        variant="outlined"
        @click="refresh()"
      >
        Refresh
      </v-btn>
      <v-btn
        v-if="!showForm && !isUpdate && !isLoading"
        class="me-2"
        variant="tonal"
        @click="$emit('onClose')"
      >
        Close
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        v-if="isOwner && !nft.price && !showForm && !isUpdate && !isLoading"
        @click="showForm = true"
      >
        Sell
      </v-btn>
      <v-btn
        color="red"
        variant="outlined"
        v-if="isSeller && nft.price && !isUpdate && !isLoading"
        @click="unList(nft.collection, nft.tokenId)"
      >
        Cancel Sell
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        v-if="!isSeller && nft.price && !isUpdate && !isLoading"
        @click="buy(nft.collection, nft.tokenId, nft.price)"
      >
        Buy
      </v-btn>
      <!-- <v-btn
        color="primary"
        variant="outlined"
        v-if="!isSeller && nft.price && !isUpdate && !isLoading"
        @click="addCart(nft.collection, nft.tokenId)"
      >
        Add Cart
      </v-btn> -->
      <v-btn
        v-if="showForm && !isUpdate && !isLoading"
        @click="showForm = false"
      >
        Cancel
      </v-btn>
      <v-btn
        v-if="showForm && !isUpdate && !isLoading"
        color="primary"
        variant="tonal"
        @click="sell(nft.collection, nft.tokenId)"
      >
        Confirm
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { ref, computed } from "vue";
import { useApiStore } from "@/stores/api.js";
import { useMarketStore } from "@/stores/market.js";
import ConsoleUtils from "@/utils/consoleUtils.js";
import TransactionDetailCard from "@/components/shared/TransactionDetailCard.vue";

export default {
  name: "Nft Detail Card",
  props: ["nft"],
  emits: ["onClose"],
  components: { TransactionDetailCard },
  setup(props) {
    const { setAlert, listNFT, unListNFT, buyNFT } = useMarketStore();
    const { post, put, putLinkCollection } = useApiStore();

    const price = ref();
    const showForm = ref(false);
    const isLoading = ref(false);
    const isUpdate = ref(false);
    const transactionDetail = ref();
    const alert = ref({
      show: false,
      color: "",
      icon: "",
      title: "",
      text: "",
    });

    const isOwner = computed(() => {
      const nftOwner = props.nft.owner;
      if (nftOwner)
        return sessionStorage.getItem("address") === nftOwner.toLowerCase();
      else return false;
    });

    const isSeller = computed(() => {
      const nftSeller = props.nft.seller;
      if (nftSeller)
        return sessionStorage.getItem("address") === nftSeller.toLowerCase();
      else return false;
    });

    const sell = async (nftCollection, nftId) => {
      try {
        isLoading.value = true;
        const res = await listNFT(nftCollection, nftId, price.value.toString());
        if (res.isSuccess) {
          transactionDetail.value = res;
          alert.value = setAlert("success", null, "NFT listed successfully!");
          isUpdate.value = true;
        } else if (res.isUserRejected) {
          alert.value = setAlert(
            "info",
            null,
            "You had rejected the transaction."
          );
        } else {
          alert.value = setAlert("error", res.code, res.message);
          isUpdate.value = true;
        }
      } catch (err) {
        alert.value = setAlert(
          "error",
          err.code,
          "We are facing some issues please try again later..."
        );
        ConsoleUtils.displayError(err);
        isUpdate.value = true;
      } finally {
        isLoading.value = false;
      }
    };

    const unList = async (nftCollection, nftId) => {
      try {
        isLoading.value = true;
        const res = await unListNFT(nftCollection, nftId);
        if (res.isSuccess) {
          transactionDetail.value = res;
          alert.value = setAlert("success", null, "NFT unlisted successfully!");
          isUpdate.value = true;
        } else if (res.isUserRejected) {
          alert.value = setAlert(
            "info",
            null,
            "You had rejected the transaction."
          );
        } else {
          alert.value = setAlert("error", res.code, res.message);
          isUpdate.value = true;
        }
      } catch (err) {
        alert.value = setAlert(
          "error",
          err.code,
          "We are facing some issues please try again later..."
        );
        ConsoleUtils.displayError(err);
        isUpdate.value = true;
      } finally {
        isLoading.value = false;
      }
    };

    const buy = async (nftCollection, nftId, nftPrice) => {
      try {
        isLoading.value = true;
        const res = await buyNFT(nftCollection, nftId, nftPrice);
        if (res.isSuccess) {
          await putLinkCollection(
            sessionStorage.getItem("address"),
            nftCollection
          );
          transactionDetail.value = res;
          alert.value = setAlert("success", null, "NFT bought successfully!");
          isUpdate.value = true;
        } else if (res.isUserRejected) {
          alert.value = setAlert(
            "info",
            null,
            "You had rejected the transaction."
          );
        } else {
          alert.value = setAlert("error", res.code, res.message);
          isUpdate.value = true;
        }
      } catch (err) {
        alert.value = setAlert(
          "error",
          err.code,
          "We are facing some issues please try again later..."
        );
        ConsoleUtils.displayError(err);
        isUpdate.value = true;
      } finally {
        isLoading.value = false;
      }
    };

    let nfts = ref([]);
    const addCart = async (nftCollection, nftId) => {
      try {
        const res = await post("/api/cart", {
          user_address: sessionStorage.getItem("address"),
        });
        nfts.value = res.data;
        let exist = false;
        if (nfts.value.length > 0) {
          for (const element of nfts.value) {
            if (
              element.collection === nftCollection &&
              element.tokenId === nftId
            ) {
              exist = true;
              alert.value = setAlert("error", "NFT already in cart... ");
              console.log("NFT already in cart");
              break;
            }
          }
        }
        if (!exist) {
          nfts.value.push({ collection: nftCollection, tokenId: nftId });
          try {
            const res = await put("/api/cart", {
              user_address: sessionStorage.getItem("address"),
              cart_content: nfts.value,
            });
            alert.value = setAlert("success", "Successfully added to cart!");
          } catch (err) {
            alert.value = setAlert(
              "error",
              "We are facing some issues please try again later..."
            );
            console.log(err);
          }
        }
      } catch (err) {
        alert.value = setAlert(
          "error",
          "We are facing some issues please try again later..."
        );
        console.log(err);
      }
    };

    const refresh = () => {
      window.location.reload();
    };

    return {
      isOwner,
      isSeller,
      isLoading,
      isUpdate,
      transactionDetail,
      showForm,
      price,
      alert,
      sell,
      unList,
      buy,
      addCart,
      refresh,
    };
  },
};
</script>
