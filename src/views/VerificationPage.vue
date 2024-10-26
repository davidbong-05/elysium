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
            <v-card-title class="text-white"
              >Please check your email for the verification token:</v-card-title
            >
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
                  :rules="[rules.required]"
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApiStore } from "@/stores/api";
import ConsoleUtils from "@/utils/consoleUtils";

export default {
  name: "VerificationPage",
  components: {},
  setup() {
    const route = useRoute();
    const { getUser, post } = useApiStore();
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
    const rules = {
      required: (v) => (!!v && v != "undefined") || "This field is required.",
    };

    const valid = computed(() => {
      return true;
    });

    const submit = async () => {
      if (valid.value === true) {
        try {
          isLoading.value = true;
          loadingMsg.value = "Verifing your token...";
          const data = {
            address: address,
            email: email.value,
            token: token.value,
          };
          const res = await post("/api/auth/verify", data);
          if (res.status === 200) {
            const res2 = await getUser(address);
            if (res2) {
              sessionStorage.setItem("role", res2.role);
              alert.value = {
                show: true,
                color: "success",
                icon: "$success",
                title: "Success",
                text: "Your email is verified!",
              };
            } else {
              alert.value = {
                show: true,
                color: "error",
                icon: "$error",
                title: "Oops",
                text: "Something went wrong. Please refresh this page to try again...",
              };
            }
          }
        } catch (err) {
          if (err.response.status < 500) {
            alert.value = {
              show: true,
              color: "error",
              icon: "$error",
              title: "Oops...",
              text: err.response.data,
            };
          } else {
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
      } else {
        alert.value = {
          show: true,
          color: "error",
          icon: "$error",
          title: "Please check your input...",
          text: "Token is required",
        };
      }
    };
    const reset = () => {
      token.value = "";
    };

    onMounted(async () => {
      try {
        if (!address) {
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Sorry",
            text: "Please login first and refresh this page to try again...",
          };
        }
        token.value = route.query.token;
        const res = await getUser(address);
        if (res) {
          email.value = res.email;
          isVerified.value = res.isVerified;
          if (isVerified.value) {
            alert.value = {
              show: true,
              color: "white",
              icon: "$info",
              title: "Info",
              text: "Your email is already been verified.",
            };
          }
        } else {
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Oops",
            text: "Something went wrong. Please refresh this page to try again...",
          };
        }
      } catch (error) {
        ConsoleUtils.displayError(error);
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
      rules,
      submit,
      reset,
    };
  },
};
</script>
