<template>
  <v-card theme="dark" width="350px">
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
    <v-card-title>Edit Profile</v-card-title>
    <v-form>
      <v-card-text>
        <v-text-field
          class="mb-2"
          v-model="email"
          label="Email"
          outlined
          required
          disabled
        ></v-text-field>
        <v-text-field
          class="mb-2"
          v-model="username"
          :rules="[rules.required, rules.username, rules.maxUsername]"
          label="Username *"
          placeholder="john_doe"
          prefix="@"
          outlined
          required
        ></v-text-field>
        <v-textarea
          class="my-4"
          v-model="bio"
          :rules="[rules.maxBio]"
          label="Bio (Optional)"
          placeholder="Insert catchy bio here ..."
          outlined
          rows="3"
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn class="me-2" variant="tonal" @click="$emit('onEdit')">
          Cancel
        </v-btn>
        <v-btn color="primary" variant="outlined" @click="save"> save </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
<script>
import { ref, computed  } from "vue";
import axios from "axios";
export default {
  name: "Edit Profile",
  props: ["user"],
  emits: ["onEdit"],
  setup(props, { emit }) {
    const email = props.user.email;
    const username = ref(props.user.username);
    const bio = ref(props.user.description);
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
    };

    const valid = computed(() => {
      return username.value.length > 0 && rules.username(username.value);
    });

    const save = async () => {
      if (valid.value === true) {
        try {
          let newDetail = {
            email: email,
            address: sessionStorage.getItem("address"),
            username: username.value,
            description: bio.value,
          }
          const res = await axios.put("/api/user", newDetail);
          if(res.status == 200) {
            emit('update:user', newDetail);
            alert.value = {
              show: true,
              color: "success",
              icon: "$success",
              title: "Success",
              text: "Profile Updated",
            };
          }
          else{
            alert.value = {
              show: true,
              color: "error",
              icon: "$error",
              title: "Oops...",
              text: res.message,
            };
          }
          console.log(res);
        } catch (err) {
          alert.value = {
          show: true,
          color: "error",
          icon: "$error",
          title: "Oops...",
          text: "We are facing some issues please try again later...",
        };
          console.log(err);
          console.log(err.response.data.message);
        }
      }
    };

    return {
      alert,
      email,
      username,
      bio,
      rules,
      save,
    };
  },
};
</script>
