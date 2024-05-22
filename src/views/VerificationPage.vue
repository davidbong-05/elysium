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
    <v-row class="d-flex justify-center" v-if="!isVerified">
      <v-col md="8" cols="12">
        <v-card variant="outlined" theme="dark">
          <div v-if="!isLoading">
            <v-card-title class="text-white"> Verify your email</v-card-title>
            <v-form @submit.prevent>
              <v-card-text>
                <v-text-field
                  class="my-4"
                  v-model="email"
                  label="Email"
                  variant="outlined"
                  density="compact"
                  readonly
                ></v-text-field>
                <v-text-field
                  class="my-4"
                  v-model="address"
                  label="Wallet Address"
                  variant="outlined"
                  density="compact"
                  readonly
                ></v-text-field>
                <v-text-field
                  class="my-4"
                  v-model="token"
                  label="Token"
                  variant="outlined"
                  density="compact"
                  required
                ></v-text-field>
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
        <v-btn
          class="my-3 bg-primary text-white"
          variant="tonal"
          block
          @click="submit"
        >
          Submit
        </v-btn>
        <v-btn variant="tonal" block @click="reset"> Reset </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApiStore } from '@/stores/api';

export default {
  name: "VerificationPage",
  components: {
  },
  setup() {
    const route = useRoute();
    const { get, post } = useApiStore();
    const alert = ref({
      show: false,
      color: "",
      icon: "",
      title: "",
      text: "",
    });

    const isLoading = ref(false);
    const loadingMsg = ref("");
    const email = ref("");
    const isVerified = ref(false);
    const address = sessionStorage.getItem("address");
    const token = ref("");

    const submit = async () => {
      try {
        isLoading.value = true;
        loadingMsg.value = "Verifing your token...";
        const data = {
          address: address,
          email: email.value,
          token: token.value,
        };
        const res = await post("/api/auth/verify", data);
        if(res.status === 200){
          alert.value = {
            show: true,
            color: "success",
            icon: "$success",
            title: "Success",
            text: "Your email is verified!",
          };
        }
      } catch (err) {
        if(err.response.status < 500){
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Oops...",
            text: err.response.data,
          };
        }
        else{
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Oops...",
            text: "We are facing some issues please try again later...",
          };
        }
        console.log(err);
      }
      isLoading.value = false;
      reset();
    }
    const reset = () => {
      token.value = "";
    };

    onMounted(async () => {
      try {
        if(!address) {
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Sorry",
            text: "Please login first and refresh this page to try again...",
          };
        }
        token.value = route.query.token;
        const res = await get("/api/user/" + address);
        if (res.status === 200) {
          email.value = res.data.email;
          isVerified.value = res.data.verifiedAt != null;
        }
        if(isVerified.value) {
          alert.value = {
            show: true,
            color: "white",
            icon: "$info",
            title: "Info",
            text: "Your email is already been verified.",
          };
        }
      } catch (error) {
        console.error(error);
      }
    });

    return {
      alert,
      isLoading,
      loadingMsg,
      isVerified,
      email,
      address,
      token,
      submit,
      reset
    };
  },
};
</script>
