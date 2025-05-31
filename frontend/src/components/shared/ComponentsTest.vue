<!--
  Test file for consolidated dashboard components
  Verifies all components work correctly before integration
-->

<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Dashboard Components Test</h2>
      </v-col>
    </v-row>

    <!-- DashboardCard Test -->
    <v-row>
      <v-col cols="12">
        <dashboard-card
          title="Test Dashboard Card"
          icon="mdi-test-tube"
          icon-color="primary"
        >
          <template #actions>
            <dashboard-action-button
              icon="mdi-refresh"
              tooltip="Refresh test data"
              @click="refreshTest"
            />
          </template>
          
          <p>This is a test of the dashboard card component.</p>
          
          <template #footer>
            <v-btn text>Test Action</v-btn>
          </template>
        </dashboard-card>
      </v-col>
    </v-row>

    <!-- StatusCard Test -->
    <v-row>
      <v-col cols="12" md="6">
        <status-card
          title="Active Tests"
          value="5"
          subtitle="Running smoothly"
          icon="mdi-check-circle"
          color="success"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <status-card
          title="Failed Tests"
          value="2"
          subtitle="Need attention"
          icon="mdi-alert-circle"
          color="error"
        />
      </v-col>
    </v-row>

    <!-- MetricCard Test -->
    <v-row>
      <v-col cols="12" md="4">
        <metric-card
          icon="mdi-timer"
          title="Response Time"
          :value="150"
          unit="ms"
          status="good"
        />
      </v-col>
      
      <v-col cols="12" md="4">
        <metric-card
          icon="mdi-memory"
          title="Memory Usage"
          :value="75"
          unit="MB"
          status="warning"
        />
      </v-col>
      
      <v-col cols="12" md="4">
        <metric-card
          icon="mdi-database"
          title="Database Load"
          :value="95"
          unit="%"
          status="error"
        />
      </v-col>
    </v-row>

    <!-- StatusChip and ProgressMetric Test -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Status Chips Test</v-card-title>
          <v-card-text>
            <div class="d-flex flex-wrap ga-2">
              <status-chip status="active" />
              <status-chip status="inactive" />
              <status-chip status="error" />
              <status-chip status="warning" />
              <status-chip status="success" />
              <status-chip status="info" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Progress Metrics Test</v-card-title>
          <v-card-text>
            <progress-metric
              title="Upload Progress"
              :value="65"
              icon="mdi-upload"
              color="primary"
            />
            <progress-metric
              title="Processing"
              :value="40"
              icon="mdi-cog"
              color="warning"
            />
            <progress-metric
              title="Completion"
              :value="90"
              icon="mdi-check"
              color="success"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {
  DashboardCard,
  StatusCard,
  MetricCard,
  StatusChip,
  DashboardActionButton,
  ProgressMetric
} from './index'

const refreshTest = () => {
  console.log('Refresh test triggered')
}
</script>

<style scoped>
/* Test-specific styles */
</style>