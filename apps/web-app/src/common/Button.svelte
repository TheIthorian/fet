<script lang="ts">
    export let variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
    export let label: string = '';
</script>

<button class={variant}>{label}</button>

<style>
    button {
        padding: 5px;
    }

    .primary {
        background-color: aqua;
    }

    .secondary {
        border-color: aqua;
        color: aqua;
    }

    .tertiary {
        color: aqua;
    }
</style>
