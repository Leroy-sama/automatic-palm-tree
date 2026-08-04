<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, status, error } = await useFetch('/api/leaderboard')
</script>

<template>
  <div class="panel-page">
    <h1>HIGH SCORES</h1>
    <p
      v-if="status === 'pending'"
      class="cta-note"
    >
      Loading…
    </p>
    <p
      v-else-if="error"
      class="form-error"
    >
      Could not load scores
    </p>
    <table
      v-else
      class="leaderboard-table"
    >
      <thead>
        <tr>
          <th>#</th>
          <th>USER</th>
          <th>WPM</th>
          <th>ACC</th>
          <th>MODE</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in data"
          :key="row.id"
        >
          <td>{{ i + 1 }}</td>
          <td>{{ row.username }}</td>
          <td>{{ row.wpm }}</td>
          <td>{{ row.accuracy }}%</td>
          <td>{{ row.mode }}</td>
        </tr>
        <tr v-if="!data?.length">
          <td colspan="5">
            No scores yet — <NuxtLink to="/solo">race solo</NuxtLink> after signing up.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
