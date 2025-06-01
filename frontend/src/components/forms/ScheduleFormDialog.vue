<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon class="mr-3" color="primary">mdi-calendar-clock</v-icon>
        {{ isEdit ? 'スケジュール編集' : 'スケジュール作成' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid">
          <!-- 基本情報 -->
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.title"
                label="スケジュール名"
                :rules="titleRules"
                required
                variant="outlined"
                prepend-inner-icon="mdi-format-title"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="説明（任意）"
                rows="2"
                variant="outlined"
                prepend-inner-icon="mdi-text"
              />
            </v-col>
          </v-row>

          <!-- Instagramアカウント選択 -->
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.igAccountId"
                :items="igAccountItems"
                label="Instagramアカウント"
                :rules="requiredRules"
                required
                variant="outlined"
                prepend-inner-icon="mdi-instagram"
              />
            </v-col>

            <!-- コンテンツ選択 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.contentId"
                :items="contentItems"
                label="投稿コンテンツ"
                :rules="requiredRules"
                required
                variant="outlined"
                prepend-inner-icon="mdi-image-multiple"
              />
            </v-col>
          </v-row>

          <!-- スケジュールタイプ選択 -->
          <v-row>
            <v-col cols="12">
              <v-radio-group
                v-model="formData.type"
                inline
                :rules="requiredRules"
                required
              >
                <template #label>
                  <div class="text-subtitle-1 font-weight-medium mb-2">
                    投稿タイプ
                  </div>
                </template>
                <v-radio label="一回限り" value="one_time" color="primary" />
                <v-radio label="繰返投稿" value="recurring" color="primary" />
                <v-radio label="ランダム投稿" value="random" color="primary" />
              </v-radio-group>
            </v-col>
          </v-row>

          <!-- 一回限り投稿設定 -->
          <v-expand-transition>
            <div v-if="formData.type === 'one_time'">
              <v-divider class="my-4" />
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="oneTimeDate"
                    label="投稿日"
                    type="date"
                    :rules="dateRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="oneTimeTime"
                    label="投稿時刻"
                    type="time"
                    :rules="timeRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-clock"
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <!-- 繰返投稿設定 -->
          <v-expand-transition>
            <div v-if="formData.type === 'recurring'">
              <v-divider class="my-4" />
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 font-weight-medium mb-3">
                    投稿曜日
                  </div>
                  <v-chip-group
                    v-model="selectedWeekdays"
                    multiple
                    color="primary"
                  >
                    <v-chip
                      v-for="(day, index) in weekdays"
                      :key="index"
                      :value="index"
                      filter
                      variant="outlined"
                    >
                      {{ day }}
                    </v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="recurringTime"
                    label="投稿時刻"
                    type="time"
                    :rules="timeRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-clock"
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <!-- ランダム投稿設定 -->
          <v-expand-transition>
            <div v-if="formData.type === 'random'">
              <v-divider class="my-4" />
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="randomMinInterval"
                    label="最小間隔（分）"
                    type="number"
                    :rules="intervalRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-timer"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="randomMaxInterval"
                    label="最大間隔（分）"
                    type="number"
                    :rules="maxIntervalRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-timer"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-switch
                    v-model="useTimeWindow"
                    label="投稿時間帯を制限する"
                    color="primary"
                    inset
                  />
                </v-col>
              </v-row>

              <v-expand-transition>
                <v-row v-if="useTimeWindow">
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="timeWindowStart"
                      label="開始時刻"
                      type="time"
                      :rules="timeRules"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-start"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="timeWindowEnd"
                      label="終了時刻"
                      type="time"
                      :rules="timeRules"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-end"
                    />
                  </v-col>
                </v-row>
              </v-expand-transition>
            </div>
          </v-expand-transition>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog" :disabled="loading">
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveSchedule"
          :loading="loading"
          :disabled="!valid"
        >
          {{ isEdit ? '更新' : '作成' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import {
    useSchedulesStore,
    useIgAccountsStore,
    usePostsStore,
    type CreateScheduleData,
    type UpdateScheduleData,
    type Schedule,
  } from '@/stores';

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
    saved: [scheduleId: string];
  }>();

  // Stores
  const schedulesStore = useSchedulesStore();
  const igAccountsStore = useIgAccountsStore();
  const postsStore = usePostsStore();

  // Reactive data
  const dialog = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  });

  const form = ref();
  const valid = ref(false);
  const loading = ref(false);

  const isEdit = computed(() => !!props.schedule);

  // Form data
  const formData = ref<CreateScheduleData>({
    igAccountId: '',
    contentId: '',
    type: 'one_time',
    title: '',
    description: '',
  });

  // 一回限り投稿用
  const oneTimeDate = ref('');
  const oneTimeTime = ref('');

  // 繰返投稿用
  const selectedWeekdays = ref<number[]>([]);
  const recurringTime = ref('');

  // ランダム投稿用
  const randomMinInterval = ref(60);
  const randomMaxInterval = ref(240);
  const useTimeWindow = ref(false);
  const timeWindowStart = ref('09:00');
  const timeWindowEnd = ref('21:00');

  // Constants
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // Computed
  const igAccountItems = computed(() =>
    igAccountsStore.accounts.map((account: any) => ({
      title: `@${account.username}`,
      value: account.id,
    }))
  );

  const contentItems = computed(() =>
    postsStore.posts.map(post => ({
      title: post.caption
        ? `${post.caption.substring(0, 30)}${post.caption.length > 30 ? '...' : ''}`
        : `投稿 ${post.id.substring(0, 8)}`,
      value: post.id,
    }))
  );

  // Validation rules
  const titleRules = [
    (v: string) => !!v || 'スケジュール名は必須です',
    (v: string) =>
      v.length <= 100 || 'スケジュール名は100文字以内で入力してください',
  ];

  const requiredRules = [(v: any) => !!v || '必須項目です'];

  const dateRules = [
    (v: string) => !!v || '投稿日は必須です',
    (v: string) => {
      const date = new Date(v);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now || '投稿日は今日以降を選択してください';
    },
  ];

  const timeRules = [(v: string) => !!v || '時刻は必須です'];

  const intervalRules = [
    (v: number) => !!v || '間隔は必須です',
    (v: number) => v > 0 || '間隔は1分以上で入力してください',
  ];

  const maxIntervalRules = [
    ...intervalRules,
    (v: number) =>
      v >= randomMinInterval.value ||
      '最大間隔は最小間隔以上で入力してください',
  ];

  // Methods
  const initializeForm = () => {
    if (props.schedule) {
      // 編集モード
      formData.value = {
        igAccountId: props.schedule.igAccount?.id || '',
        contentId: props.schedule.content?.id || '',
        type: props.schedule.type,
        title: props.schedule.title,
        description: props.schedule.description || '',
      };

      if (props.schedule.type === 'one_time' && props.schedule.nextRunAt) {
        const date = new Date(props.schedule.nextRunAt.seconds * 1000);
        oneTimeDate.value = date.toISOString().split('T')[0] || '';
        oneTimeTime.value =
          date.toTimeString().split(' ')[0]?.substring(0, 5) || '';
      }

      if (props.schedule.type === 'recurring' && props.schedule.repeatRule) {
        selectedWeekdays.value = props.schedule.repeatRule.weekdays || [];
        recurringTime.value = props.schedule.repeatRule.time || '';
      }

      if (props.schedule.type === 'random' && props.schedule.repeatRule) {
        randomMinInterval.value = props.schedule.repeatRule.minInterval || 60;
        randomMaxInterval.value = props.schedule.repeatRule.maxInterval || 240;

        if (props.schedule.repeatRule.timeWindow) {
          useTimeWindow.value = true;
          timeWindowStart.value = props.schedule.repeatRule.timeWindow.start;
          timeWindowEnd.value = props.schedule.repeatRule.timeWindow.end;
        }
      }
    } else {
      // 新規作成モード
      resetForm();
    }
  };

  const resetForm = () => {
    formData.value = {
      igAccountId: '',
      contentId: '',
      type: 'one_time',
      title: '',
      description: '',
    };

    oneTimeDate.value = '';
    oneTimeTime.value = '';
    selectedWeekdays.value = [];
    recurringTime.value = '';
    randomMinInterval.value = 60;
    randomMaxInterval.value = 240;
    useTimeWindow.value = false;
    timeWindowStart.value = '09:00';
    timeWindowEnd.value = '21:00';
  };

  const buildScheduleData = (): CreateScheduleData | UpdateScheduleData => {
    const baseData = { ...formData.value };

    if (formData.value.type === 'one_time') {
      const scheduledTime = new Date(
        `${oneTimeDate.value}T${oneTimeTime.value}:00`
      );
      baseData.scheduledTime = scheduledTime.toISOString();
    }

    if (formData.value.type === 'recurring') {
      baseData.repeatRule = {
        weekdays: selectedWeekdays.value,
        time: recurringTime.value,
        timezone: 'Asia/Tokyo',
      };
    }

    if (formData.value.type === 'random') {
      baseData.repeatRule = {
        minInterval: randomMinInterval.value,
        maxInterval: randomMaxInterval.value,
        timezone: 'Asia/Tokyo',
      };

      if (useTimeWindow.value) {
        baseData.repeatRule.timeWindow = {
          start: timeWindowStart.value,
          end: timeWindowEnd.value,
        };
      }
    }

    if (isEdit.value && props.schedule) {
      return {
        scheduleId: props.schedule.id,
        ...baseData,
      } as UpdateScheduleData;
    }

    return baseData as CreateScheduleData;
  };

  const saveSchedule = async () => {
    if (!form.value?.validate()) return;

    try {
      loading.value = true;
      const scheduleData = buildScheduleData();

      let scheduleId: string;

      if (isEdit.value) {
        await schedulesStore.updateSchedule(scheduleData as UpdateScheduleData);
        scheduleId = props.schedule!.id;
      } else {
        scheduleId = await schedulesStore.createSchedule(
          scheduleData as CreateScheduleData
        );
      }

      emit('saved', scheduleId);
      closeDialog();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      loading.value = false;
    }
  };

  const closeDialog = () => {
    dialog.value = false;
    setTimeout(() => {
      resetForm();
      form.value?.resetValidation();
    }, 300);
  };

  // Watchers
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        initializeForm();
      }
    }
  );

  // Lifecycle
  onMounted(async () => {
    // データを取得
    if (igAccountsStore.accounts.length === 0) {
      await igAccountsStore.loadAccounts();
    }
    if (postsStore.posts.length === 0) {
      await postsStore.loadPosts(true);
    }
  });
</script>

<style scoped>
  .v-chip-group {
    gap: 8px;
  }
</style>
