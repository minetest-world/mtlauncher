import { writable } from 'svelte/store';

export const modal = writable({
    visible: false,

    // fields
    title: false,
    content: false,
    component: false
});

export function showText(title, content) {
    modal.set({
        visible: true,

        component: false,
        title,
        content
    });
}

export function showComponent(component, args) {
    modal.set({
        visible: true,

        title: false,
        content: false,
        component: {
            this: component,
            args
        }
    });
}

export function close() {
    modal.set({
        visible: false,

        title: false,
        content: false,
        component: false
    });
}