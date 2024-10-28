<template>
  <v-card-title>🧾 Transaction Receipt</v-card-title>
  <v-card-subtitle v-if="transactionDetail">
    <v-row dense>
      <v-col cols="4">
        <strong>Transaction Hash:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.hash }}</span>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <strong>Block Number:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.blockNumber }}</span>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <strong>Status:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.status }}</span>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <strong>From:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.from }}</span>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <strong>To:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.to }}</span>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <strong>Gas Used:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.gasUsed }}</span>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <strong>Effective Gas Price:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.gasPrice }} ETH</span>
      </v-col>
      <v-col cols="4">
        <strong>Total Cost:</strong>
      </v-col>
      <v-col cols="8">
        <span>{{ transactionDetail.fee }} ETH</span>
      </v-col>
    </v-row>
  </v-card-subtitle>
  <v-card-text v-else>
    <v-alert type="info" border="left" colored-border>
      ⏳ Loading transaction receipt...
    </v-alert>
  </v-card-text>
</template>

<script>
export default {
  name: "transactionDetail",
  props: {
    transactionDetail: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const transactionDetail = props.transactionDetail;
    return { transactionDetail };
  },
};
</script>
