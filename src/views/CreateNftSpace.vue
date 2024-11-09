<template>
  <v-container>
    <v-alert
      v-if="alert.show"
      class="my-3"
      theme="dark"
      :color="alert.color"
      :icon="alert.icon"
      :title="alert.title"
      :text="alert.text"
      variant="tonal"
      density="compact"
    ></v-alert>
    <v-row v-if="isVerified">
      <v-col md="8" cols="12">
        <v-card variant="outlined" theme="dark">
          <div v-if="!isLoading">
            <v-card-title class="text-white"> Create New NFT</v-card-title>
            <v-form @submit.prevent>
              <v-card-text>
                <v-text-field
                  class="mb-2"
                  v-model="wallet"
                  label="Wallet Address"
                  variant="outlined"
                  density="compact"
                  readonly
                ></v-text-field>
                <v-select
                  class="my-4"
                  v-model="selectedCollection"
                  :rules="[rules.required]"
                  :items="collections"
                  item-title="name"
                  item-value="address"
                  label="Collection"
                  variant="outlined"
                  density="compact"
                  return-object
                  required
                >
                </v-select>
                <v-file-input
                  class="my-4"
                  v-model="file"
                  :rules="[rules.required, rules.filesType]"
                  label="File"
                  show-size
                  variant="outlined"
                  density="compact"
                  required
                ></v-file-input>
                <v-text-field
                  class="my-4"
                  v-model="name"
                  :rules="[
                    rules.required,
                    rules.min,
                    rules.maxName,
                    rules.name,
                  ]"
                  label="Name"
                  variant="outlined"
                  density="compact"
                  required
                ></v-text-field>
                <v-textarea
                  class="my-4"
                  v-model="description"
                  :rules="[rules.required, rules.min, rules.maxDescription]"
                  label="Description"
                  variant="outlined"
                  rows="3"
                  density="compact"
                  required
                ></v-textarea>
                <!-- <div class="d-flex justify-space-between align-center">
                  <div>
                    <v-label>List it for Sale on Elysium?</v-label>
                  </div>
                  <div>
                    <v-switch
                      v-model="onSale"
                      true-value="Yes"
                      false-value="No"
                      color="white"
                      density="compact"
                    ></v-switch>
                  </div>
                </div> -->
                <v-text-field
                  class="my-4"
                  v-model="price"
                  :rules="[rules.required, rules.minPrice]"
                  label="Price"
                  variant="outlined"
                  density="compact"
                  suffix="ETH"
                  type="number"
                  min="0.001"
                  dirty
                  required
                  v-if="onSale === 'Yes'"
                ></v-text-field>
                <!-- <div class="d-flex justify-space-between align-center">
                <div>
                  <v-label>Free Minting</v-label>
                </div>
                <div>
                  <v-switch
                    v-model="freeMint"
                    true-value="Yes"
                    false-value="No"
                    color="white"
                    density="compact"
                    disabled
                  ></v-switch>
                </div>
              </div> -->
              </v-card-text>
            </v-form>
          </div>
          <v-responsive
            v-if="isLoading"
            class="mx-auto text-center"
            height="500px"
          >
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
      </v-col>
      <v-col md="4" cols="12">
        <v-card variant="outlined">
          <v-card-title class="text-white">Preview</v-card-title>
          <v-img :src="previewImg" contain max-height="200"></v-img>
          <v-card-text> Collection: {{ selectedCollection.name }} </v-card-text>
          <v-card-text>
            Collection Address: {{ selectedCollection.address }}
          </v-card-text>
          <v-card-text> Name: {{ name }} </v-card-text>
          <v-card-text> Description: {{ description }} </v-card-text>
          <v-card-text> For Sale: {{ onSale }} </v-card-text>
          <v-card-text v-if="onSale === 'Yes'">
            Price: {{ price }} ETH
          </v-card-text>
          <!-- <v-card-text> Free Minting: {{ freeMint }} </v-card-text> -->
        </v-card>
        <v-btn
          class="my-3 bg-primary text-white"
          variant="tonal"
          :block="true"
          @click="submit"
        >
          Mint
        </v-btn>
        <v-btn variant="tonal" :block="true" @click="reset"> Reset </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useMarketStore } from "@/stores/market.js";
import { UserRole } from "@/models/enums.js";
import Alert from "@/models/alert.js";

export default {
  name: "Create Nft Space",
  components: {},
  setup() {
    const {
      uploadFileToIPFS,
      uploadJSONToIPFS,
      getMyCollection,
      getNftCollection,
      mintNFT,
      listNFT,
    } = useMarketStore();

    const wallet = sessionStorage.getItem("address");
    const isVerified =
      sessionStorage.getItem("role") !== UserRole.UNVERIFIED_USER;
    const isLoading = ref(false);
    const loadingMsg = ref("nothing");
    const collections = ref([]);
    const selectedCollection = ref({
      name: "",
      address: "",
    });
    const name = ref("");
    const description = ref("");
    const onSale = ref("No");
    const price = ref();
    const freeMint = ref("No");
    const file = ref();

    const alert = ref({});

    const rules = {
      required: (value) => !!value || "This field is required.",
      min: (v) => v.length >= 3 || "Min 3 characters",
      maxName: (v) => v.length <= 25 || "Max 25 characters",
      maxDescription: (v) => v.length <= 250 || "Max 250 characters",
      name: (v) => {
        const pattern = /^[^\W]+[a-zA-Z0-9_ ]+[^\W]+$/;
        return pattern.test(v) || "Invalid name.";
      },
      fileType: (v) => {
        if (v) {
          const pattern = /image/;
          return pattern.test(v.type) || "Image only. (jpg, jpeg, png)";
        }
        return false;
      },

      filesType: (v) => {
        if (v) {
          return rules.fileType(v[0]);
        }
        return false;
      },
      minPrice: (v) => v >= 0.001 || "Min 0.001 ETH",
    };

    const valid = computed(() => {
      if (onSale.value === "Yes") {
        return (
          isVerified &&
          name.value.length >= 3 &&
          name.value.length <= 25 &&
          description.value.length >= 3 &&
          description.value.length <= 250 &&
          rules.name(name.value) === true &&
          rules.fileType(file.value) === true &&
          price.value >= 0.001
        );
      } else {
        return (
          isVerified &&
          name.value.length >= 3 &&
          name.value.length <= 25 &&
          description.value.length >= 3 &&
          description.value.length <= 250 &&
          rules.name(name.value) === true &&
          rules.fileType(file.value) === true
        );
      }
    });
    const previewImg = computed(() => {
      if (file.value) {
        return URL.createObjectURL(file.value);
      }
      return "";
    });

    const submit = async () => {
      if (valid.value === true) {
        try {
          isLoading.value = true;
          loadingMsg.value = "Uploading the file to IPFS...";
          const fileData = await uploadFileToIPFS(file.value);
          console.log("fileData.IpfsHash", fileData.IpfsHash);
          const json = {
            name: name.value,
            description: description.value,
            image: fileData.IpfsHash,
          };
          const jsonFile = await uploadJSONToIPFS(json);
          console.log("file", jsonFile.IpfsHash);
          loadingMsg.value = "Minting the NFT...";
          const res = await mintNFT(
            sessionStorage.getItem("address"),
            selectedCollection.value.address,
            jsonFile.IpfsHash
          );
          if (res.isSuccess) {
            if (onSale.value === "Yes") {
              try {
                loadingMsg.value = "Listing the NFT on sale...";
                const res2 = await listNFT(
                  selectedCollection.value.address,
                  res,
                  price.value.toString()
                );
                if (!res2.isSuccess) {
                  if (res.isUserRejected) {
                    alert.value.setInfo(
                      "You had rejected the listing transaction."
                    );
                  } else {
                    alert.value.setError(res.message, res.code);
                  }
                }
              } catch (err) {
                alert.value.setError(
                  "We are facing some issues please try again later."
                );
              }
            }
            alert.value.setSuccess("NFT Minted Successfully");
            reset();
          } else if (res.isUserRejected) {
            alert.value.setInfo("You had rejected the transaction.");
          } else {
            alert.value.setError(res.message, res.code);
          }
        } catch (err) {
          alert.value.setError(
            "We are facing some issues please try again later..."
          );
        }
        isLoading.value = false;
      } else {
        alert.value.setError("Please check your input and try again.");
      }
    };

    const reset = () => {
      name.value = "";
      description.value = "";
      onSale.value = "No";
      price.value = "";
      freeMint.value = "No";
      file.value = null;
      alert.value.hide();
    };

    onMounted(async () => {
      try {
        alert.value = new Alert();
        isLoading.value = true;
        loadingMsg.value = "Fetching your collections...";
        const res = await getMyCollection();

        if (res.length === 0) {
          alert.value.setError(
            "You don't have any collection. Please create one first."
          );
          loadingMsg.value = "Redirecting to create collection page...";
          setTimeout(() => {
            window.location.href = "/user/collection/";
          }, 3000);
          return;
        } else {
          for (let i = 0; i < res.length; i++) {
            let collectionItem = await getNftCollection(res[i]);
            let collection = {
              address: res[i],
              name: collectionItem.name,
            };
            collections.value.push(collection);
          }
          selectedCollection.value = collections.value[0];
          isLoading.value = false;
        }
        if (!isVerified) {
          alert.value.setError("Please verify your email first.");
        }
      } catch (err) {
        alert.value.setError(
          "We are facing some issues please try again later."
        );
      }
    });

    return {
      wallet,
      isVerified,
      isLoading,
      loadingMsg,
      selectedCollection,
      collections,
      name,
      description,
      onSale,
      price,
      freeMint,
      file,
      alert,
      previewImg,
      rules,
      submit,
      reset,
    };
  },
};
</script>
