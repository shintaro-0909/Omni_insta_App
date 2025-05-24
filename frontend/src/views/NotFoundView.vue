<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon
          icon="mdi-emoticon-sad-outline"
          size="120"
          color="grey-lighten-1"
          class="mb-6"
        />
        
        <h1 class="text-h2 font-weight-bold mb-4">
          404
        </h1>
        
        <h2 class="text-h4 mb-6">
          ページが見つかりません
        </h2>
        
        <p class="text-h6 text-grey-darken-1 mb-8">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        
        <v-btn
          color="primary"
          size="large"
          to="/"
          class="mr-4"
        >
          <v-icon start>mdi-home</v-icon>
          ホームに戻る
        </v-btn>
        
        <v-btn
          variant="outlined"
          size="large"
          @click="$router.go(-1)"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          前のページに戻る
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// 404ページは静的なので特別なロジックは不要
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style> 