<template>
  <v-dialog v-model="dialog" max-width="700px">
    <v-card v-if="schedule">
      <v-card-title class="text-h5 pa-6">
        <v-icon class="mr-3" :color="statusColor">{{ statusIcon }}</v-icon>
        {{ schedule.title }}
        <v-spacer />
        <v-chip :color="statusColor" variant="tonal" size="small">
          {{ statusText }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- 基本情報 -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="text-h6 mb-3">基本情報</div>

            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-format-title</v-icon>
                </template>
                <v-list-item-title>スケジュール名</v-list-item-title>
                <v-list-item-subtitle>{{
                  schedule.title
                }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="schedule.description">
                <template #prepend>
                  <v-icon>mdi-text</v-icon>
                </template>
                <v-list-item-title>説明</v-list-item-title>
                <v-list-item-subtitle>{{
                  schedule.description
                }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title>投稿タイプ</v-list-item-title>
                <v-list-item-subtitle>{{ typeText }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-instagram</v-icon>
                </template>
                <v-list-item-title>Instagramアカウント</v-list-item-title>
                <v-list-item-subtitle>
                  @{{ schedule.igAccount?.username || 'Unknown' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- スケジュール詳細 -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="text-h6 mb-3">スケジュール詳細</div>

            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>次回実行予定</v-list-item-title>
                <v-list-item-subtitle>{{ nextRunText }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="schedule.lastRunAt">
                <template #prepend>
                  <v-icon>mdi-clock-check</v-icon>
                </template>
                <v-list-item-title>最終実行日時</v-list-item-title>
                <v-list-item-subtitle>{{ lastRunText }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-counter</v-icon>
                </template>
                <v-list-item-title>実行回数</v-list-item-title>
                <v-list-item-subtitle
                  >{{ schedule.runCount }}回</v-list-item-subtitle
                >
              </v-list-item>

              <v-list-item v-if="schedule.retryCount > 0">
                <template #prepend>
                  <v-icon color="warning">mdi-alert</v-icon>
                </template>
                <v-list-item-title>リトライ回数</v-list-item-title>
                <v-list-item-subtitle
                  >{{ schedule.retryCount }}回</v-list-item-subtitle
                >
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- 繰返設定 -->
        <v-row v-if="schedule.repeatRule" class="mb-4">
          <v-col cols="12">
            <div class="text-h6 mb-3">繰返設定</div>

            <v-list density="compact">
              <!-- 繰返投稿の設定 -->
              <template v-if="schedule.type === 'recurring'">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-week</v-icon>
                  </template>
                  <v-list-item-title>投稿曜日</v-list-item-title>
                  <v-list-item-subtitle>{{
                    weekdaysText
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>投稿時刻</v-list-item-title>
                  <v-list-item-subtitle>{{
                    schedule.repeatRule.time
                  }}</v-list-item-subtitle>
                </v-list-item>
              </template>

              <!-- ランダム投稿の設定 -->
              <template v-if="schedule.type === 'random'">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-timer</v-icon>
                  </template>
                  <v-list-item-title>投稿間隔</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ schedule.repeatRule.minInterval }}分 〜
                    {{ schedule.repeatRule.maxInterval }}分
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="schedule.repeatRule.timeWindow">
                  <template #prepend>
                    <v-icon>mdi-clock-time-eight</v-icon>
                  </template>
                  <v-list-item-title>投稿時間帯</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ schedule.repeatRule.timeWindow.start }} 〜
                    {{ schedule.repeatRule.timeWindow.end }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list>
          </v-col>
        </v-row>

        <!-- 投稿コンテンツ -->
        <v-row v-if="schedule.content">
          <v-col cols="12">
            <div class="text-h6 mb-3">投稿コンテンツ</div>

            <v-card variant="outlined" class="mb-3">
              <v-card-text class="pa-4">
                <!-- 画像プレビュー -->
                <div v-if="schedule.content.mediaUrls?.length" class="mb-3">
                  <v-carousel
                    v-if="schedule.content.mediaUrls.length > 1"
                    height="200"
                    hide-delimiter-background
                    show-arrows="hover"
                  >
                    <v-carousel-item
                      v-for="(url, index) in schedule.content.mediaUrls"
                      :key="index"
                    >
                      <v-img :src="url" height="200" cover class="rounded" />
                    </v-carousel-item>
                  </v-carousel>

                  <v-img
                    v-else
                    :src="schedule.content.mediaUrls[0]"
                    height="200"
                    cover
                    class="rounded"
                  />
                </div>

                <!-- キャプション -->
                <div v-if="schedule.content.caption" class="mb-3">
                  <div class="text-subtitle-2 mb-1">キャプション</div>
                  <div class="text-body-2">{{ schedule.content.caption }}</div>
                </div>

                <!-- タグ -->
                <div v-if="schedule.content.tags?.length">
                  <div class="text-subtitle-2 mb-2">タグ</div>
                  <v-chip-group>
                    <v-chip
                      v-for="tag in schedule.content.tags"
                      :key="tag"
                      size="small"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- メタ情報 -->
        <v-row>
          <v-col cols="12">
            <div class="text-h6 mb-3">メタ情報</div>

            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-plus</v-icon>
                </template>
                <v-list-item-title>作成日時</v-list-item-title>
                <v-list-item-subtitle>{{ createdAtText }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-edit</v-icon>
                </template>
                <v-list-item-title>更新日時</v-list-item-title>
                <v-list-item-subtitle>{{ updatedAtText }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog"> 閉じる </v-btn>
        <v-btn color="primary" variant="elevated" @click="editSchedule">
          編集
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { Schedule } from '@/stores';

  // Props
  interface Props {
    modelValue: boolean;
    schedule?: Schedule;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    schedule: undefined,
  });

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    edit: [schedule: Schedule];
  }>();

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  });

  const statusColor = computed(() => {
    if (!props.schedule) return 'grey';

    switch (props.schedule.status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'error':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'grey';
    }
  });

  const statusIcon = computed(() => {
    if (!props.schedule) return 'mdi-help';

    switch (props.schedule.status) {
      case 'active':
        return 'mdi-play-circle';
      case 'paused':
        return 'mdi-pause-circle';
      case 'error':
        return 'mdi-alert-circle';
      case 'completed':
        return 'mdi-check-circle';
      default:
        return 'mdi-help-circle';
    }
  });

  const statusText = computed(() => {
    if (!props.schedule) return '';

    switch (props.schedule.status) {
      case 'active':
        return 'アクティブ';
      case 'paused':
        return '一時停止';
      case 'error':
        return 'エラー';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  });

  const typeText = computed(() => {
    if (!props.schedule) return '';

    switch (props.schedule.type) {
      case 'one_time':
        return '一回限り投稿';
      case 'recurring':
        return '繰返投稿';
      case 'random':
        return 'ランダム投稿';
      default:
        return '不明';
    }
  });

  const nextRunText = computed(() => {
    if (!props.schedule?.nextRunAt) return '未設定';

    const date = new Date(props.schedule.nextRunAt.seconds * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const lastRunText = computed(() => {
    if (!props.schedule?.lastRunAt) return '未実行';

    const date = new Date(props.schedule.lastRunAt.seconds * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const weekdaysText = computed(() => {
    if (!props.schedule?.repeatRule?.weekdays) return '';

    const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return props.schedule.repeatRule.weekdays
      .map(day => weekdayNames[day])
      .join('、');
  });

  const createdAtText = computed(() => {
    if (!props.schedule?.createdAt) return '';

    const date = new Date(props.schedule.createdAt.seconds * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const updatedAtText = computed(() => {
    if (!props.schedule?.updatedAt) return '';

    const date = new Date(props.schedule.updatedAt.seconds * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  // Methods
  const closeDialog = () => {
    dialog.value = false;
  };

  const editSchedule = () => {
    if (props.schedule) {
      emit('edit', props.schedule);
    }
  };
</script>

<style scoped>
  .v-carousel {
    border-radius: 8px;
  }

  .v-chip-group {
    gap: 8px;
  }
</style>
