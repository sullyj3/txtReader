<script lang="ts">
	import Menu from "./Menu.svelte";
	import TextDisplay from "./TextDisplay.svelte";
	import type { DisplayText } from "./types";

	let displayText: DisplayText = null;
	let shouldJoinLines: boolean = false;

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

<main on:paste={handlePaste}>
	<Menu
		bind:menuDisplayText={displayText}
		bind:menuShouldJoinLines={shouldJoinLines}
	/>
	<TextDisplay {displayText} {shouldJoinLines} />
</main>

<style>
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
