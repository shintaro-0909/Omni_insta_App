<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
  >
    <v-card v-if="post">
      <v-card-title class="d-flex align-center">
        <span class="text-h6 font-weight-bold">コンテンツ詳細</span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- 画像カルーセル -->
        <v-carousel
          v-if="post.mediaUrls.length > 1"
          height="400"
          hide-delimiter-background
          show-arrows="hover"
        >
          <v-carousel-item
            v-for="(url, index) in post.mediaUrls"
            :key="index"
          >
            <v-img
              :src="url"
              height="400"
              cover
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate />
                </div>
              </template>
              <template #error>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon size="64" color="grey-lighten-2">
                    mdi-image-broken-variant
                  </v-icon>
                </div>
              </template>
            </v-img>
          </v-carousel-item>
        </v-carousel>

        <!-- 単一画像 -->
        <v-img
          v-else-if="post.mediaUrls.length === 1"
          :src="post.mediaUrls[0]"
          height="400"
          cover
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate />
            </div>
          </template>
          <template #error>
            <div class="d-flex align-center justify-center fill-height">
              <v-icon size="64" color="grey-lighten-2">
                mdi-image-broken-variant
              </v-icon>
            </div>
          </template>
        </v-img>

        <!-- コンテンツ情報 -->
        <div class="pa-6">
          <!-- キャプション -->
          <div class="mb-4">
            <h3 class="text-h6 font-weight-bold mb-2">キャプション</h3>
            <div class="text-body-1" style="white-space: pre-wrap;">
              {{ post.caption }}
            </div>
          </div>

          <!-- タグ -->
          <div v-if="post.tags.length > 0" class="mb-4">
            <h3 class="text-h6 font-weight-bold mb-2">タグ</h3>
            <div>
              <v-chip
                v-for="tag in post.tags"
                :key="tag"
                size="small"
                variant="outlined"
                class="mr-2 mb-2"
              >
                {{ tag }}
              </v-chip>
            </div>
          </div>

          <!-- 統計情報 -->
          <div class="mb-4">
            <h3 class="text-h6 font-weight-bold mb-2">統計情報</h3>
            <v-row>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ post.mediaUrls.length }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    画像数
                  </div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold text-success">
                    {{ post.timesPosted }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    投稿回数
                  </div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold text-info">
                    {{ post.tags.length }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    タグ数
                  </div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold text-warning">
                    {{ post.caption.length }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    文字数
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- メタ情報 -->
          <div>
            <h3 class="text-h6 font-weight-bold mb-2">メタ情報</h3>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-plus</v-icon>
                </template>
                <v-list-item-title>作成日時</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDateTime(post.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-edit</v-icon>
                </template>
                <v-list-item-title>更新日時</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDateTime(post.updatedAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-identifier</v-icon>
                </template>
                <v-list-item-title>コンテンツID</v-list-item-title>
                <v-list-item-subtitle>
                  {{ post.id }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          color="primary"
          variant="flat"
          @click="$emit('edit', post)"
        >
          <v-icon start>mdi-pencil</v-icon>
          編集
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          @click="$emit('delete', post)"
        >
          <v-icon start>mdi-delete</v-icon>
          削除
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Post } from '@/stores/posts'

interface Props {
  modelValue: boolean
  post?: Post | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', post: Post): void
  (e: 'delete', post: Post): void
}

defineProps<Props>()
defineEmits<Emits>()

// Methods
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy/MM/dd HH:mm:ss', { locale: ja })
}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
  max-height: 90vh;
}
</style> 