<script>
    export let data;
    export let form;
</script>

<div>
    <form method="POST">
        {#if form?.missing}<p class="error">The email field is required</p>{/if}
        {#if form?.incorrect}<p class="error">Invalid credentials!</p>{/if}

        <label for="email">Email</label>
        <input name="email" type="email" value={form?.email ?? ''} />
        <label for="password">Password</label>
        <input name="password" type="password" />
        <button type="submit">Login</button>
    </form>
</div>
