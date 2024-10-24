<template>

<n-button tertiary @click="openPopup">popup</n-button>

<n-button tertiary @click="openOptions">options</n-button>

</template>

<script lang="ts" setup>

function openPopup(){
    window.location.href = "./popup.html";
}

function openOptions(){
    window.location.href = "./options.html";
}

</script>

<style scoped></style>