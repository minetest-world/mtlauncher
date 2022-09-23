import { writable } from 'svelte/store';

export const selectedVersion = writable({});
export const selectedServer = writable({});

export let preferences = false;