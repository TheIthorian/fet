<script>
    import Button from '../../common/Button.svelte';
    import Dashboard from '../../components/Dashboard.svelte';
    import UserSetup from '../../components/UserSetup.svelte';

    import { user } from '../../stores';
</script>

<div>
    Dashboard for {$user?.displayName}
    <Button label="a button" />
</div>

{#if $user?.isSetupRequired === true}
    <UserSetup />
{:else}
    <Dashboard />
{/if}
