<template>
  <v-card-title class="headline">🧾 Transaction Receipt</v-card-title>
  <v-card-subtitle v-if="transactionDetail">
    <v-row dense>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>Transaction Hash:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.transactionHash }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>Block Number:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.blockNumber }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>Status:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span :class="statusClass">{{ transactionDetail.status }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>From:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.from.truncateAddress() }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>To:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.to }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>Gas Used:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.gasUsed }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>Effective Gas Price:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.gasPrice }} wei</span>
          </v-list-item-content>
        </v-list-item>
      </v-col>
      <v-col cols="12">
        <v-list-item>
          <v-list-item-content>
            <strong>Total Cost:</strong>
          </v-list-item-content>
          <v-list-item-content>
            <span>{{ transactionDetail.fee }} ETH</span>
          </v-list-item-content>
        </v-list-item>
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
