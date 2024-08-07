<template>
  <v-card class="mt-md-8 me-md-2 pa-md-2" width="450px" theme="dark">
    <v-card-title class="d-flex justify-space-between align-center">
      <h2>Sign Up Now</h2>
    </v-card-title>
    <v-divider></v-divider>
    <v-alert
      v-if="alert.show"
      class="mt-4 mx-6"
      theme="dark"
      :color="alert.color"
      :icon="alert.icon"
      :title="alert.title"
      :text="alert.text"
      variant="tonal"
      density="compact"
    ></v-alert>
    <v-form @submit.prevent v-if="alert.title != 'Success'">
      <v-container class="overflow-y-auto" style="height: 50vh" fluid>
        <v-card-text>
          <v-text-field
            class="mb-2"
            v-model="username"
            :rules="[rules.required, rules.username, rules.maxUsername]"
            label="Username"
            placeholder="john_doe"
            prefix="@"
            variant="outlined"
            required
          ></v-text-field>
          <v-textarea
            class="my-4"
            v-model="desc"
            :rules="[rules.maxBio]"
            label="Bio (Optional)"
            placeholder="Too awesome for bio..."
            rows="3"
            variant="outlined"
          ></v-textarea>
          <v-text-field
            class="mt-2"
            v-model="email"
            :rules="[rules.required, rules.email]"
            label="Email"
            placeholder="eg. example@siswa.unimas.my"
            variant="outlined"
            required
          ></v-text-field>
        </v-card-text>
      </v-container>
      <v-divider></v-divider>
      <v-card-actions class="d-flex justify-center align-center">
        <v-btn
          color="secondary"
          large
          variant="outlined"
          @click="$emit('onSignUp', false)"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          large
          variant="outlined"
          type="submit"
          @click="submit"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-form>
    <v-card-actions
      class="d-flex justify-center align-center"
      v-if="alert.title == 'Success'"
    >
      <v-btn
        color="primary"
        large
        variant="outlined"
        @click="$emit('onSignUp', false)"
        >Close</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
<script>
import { ref, computed } from "vue";
import { useApiStore } from "@/stores/api";

import { useMarketStore } from "@/stores/market";

export default {
  name: "SignUp",
  emits: ["onSignUp"],
  setup(props, { emit }) {
    const store = useMarketStore();
    const { post } = useApiStore();

    const username = ref("");
    const desc = ref("");
    const email = ref("");

    const alert = ref({
      show: false,
      color: "",
      icon: "",
      title: "",
      text: "",
    });

    const rules = {
      required: (v) => !!v || "This field is required.",
      username: (v) => {
        const pattern = /^[a-zA-Z0-9_]+$/;
        return pattern.test(username.value) || "Invalid username.";
      },
      maxUsername: (v) => v.length <= 25 || "Max 25 characters.",
      maxBio: (v) => v.length <= 150 || "Max 150 characters.",
      email: () => {
        // const pattern =
        //   /^[^\s@]+@(siswa\.unimas\.my)|(davidbong05@gmail\.com)$/;
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email.value) || "Please enter a valid siswa email.";
      },
    };

    const valid = computed(() => {
      return (
        username.value.length > 0 &&
        email.value.length > 0 &&
        rules.username(username.value) === true &&
        rules.email(email.value) === true
      );
    });

    const submit = async () => {
      try {
        if (valid.value === true) {
          const data = {
            username: username.value,
            address: store.account,
            email: email.value,
            profile_url:
              "https://source.boringavatars.com/beam/250/" + username.value,
            background_url:
              "https://source.boringavatars.com/pixel/500/" +
              username.value +
              "?square",
            description: desc.value,
          };
          const res = await post("/api/user", data);
          if (res.status === 200) {
            console.log(res.data);
            alert.value = {
              show: true,
              color: "success",
              icon: "$success",
              title: "Success",
              text: "Sign Up Successfully! Press the Connect button again to login",
            };
          }
        } else {
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Oops...",
            text: "Please check your input and try again",
          };
          console.log("Invalid", valid.value);
        }
      } catch (error) {
        console.log(error);
        if (error.response.status === 400) {
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Oops...",
            text: error.response.data.message,
          };
        } else {
          alert.value = {
            show: true,
            color: "error",
            icon: "$error",
            title: "Oops...",
            text: "Something went wrong. Please try again later",
          };
        }
      }
    };

    return {
      username,
      desc,
      email,
      alert,
      rules,
      submit,
    };
  },
};
</script>
