<script lang="ts">
	import Menu from "./Menu.svelte";
	import TextDisplay from "./TextDisplay.svelte";
	import type { DisplayText } from "./types";

	let displayText: DisplayText = null;
	let shouldJoinLines: boolean = false;

	let darkMode: boolean = false;
	let theme: Theme = "lightTheme";
	$: theme = darkMode ? "darkTheme" : "lightTheme";

	const handlePaste = (ev: ClipboardEvent) => {
		ev.preventDefault();
		displayText = {
			type: "Pasted",
			text: ev.clipboardData.getData("text"),
		};
	};

</script>

<svelte:head>
	<title>TxtReader</title>
</svelte:head>

<main on:paste={handlePaste} class='{theme}' >
	<Menu
		bind:menuDisplayText={displayText}
		bind:menuShouldJoinLines={shouldJoinLines}
		bind:darkMode
	/>
	<TextDisplay {displayText} {shouldJoinLines} />
</main>

<style>
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		padding: 8px;
		min-height: 100%;
	}

	.darkTheme {
		background-color: #222;
		color: #eee;
	}
</style>
