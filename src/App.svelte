<script lang="ts">
	import { onMount } from "svelte";
	import Menu from "./Menu.svelte";
	import TextDisplay from "./TextDisplay.svelte";
	import type { DisplayText, MenuSetDisplayTextEvent, Theme } from "./types";

	let displayText: DisplayText = null;

	let shouldJoinLines: boolean = false;

	let darkMode: boolean = false;
	let theme: Theme = "lightTheme";
	$: theme = darkMode ? "darkTheme" : "lightTheme";

	// Persist displayText. This ensures that our state survives
	// reloads and chrome's memory saver tab discarding.
	// TODO we should persist the entire state, not just the displayText.
	const saveDisplayText = () => {
		console.log("saving displayText");
		window.sessionStorage.setItem("displayText", JSON.stringify(displayText));
	};

	const handlePaste = (ev: ClipboardEvent) => {
		ev.preventDefault();
		displayText = {
			type: "Pasted",
			text: ev.clipboardData.getData("text"),
		};
		saveDisplayText();
	};

	const onSetDisplayText = (ev: CustomEvent) => {
		const menuSetDisplayTextEvent = ev.detail as MenuSetDisplayTextEvent;
		// displayText = ev.detail.displayText;
		displayText = menuSetDisplayTextEvent.displayText;
		saveDisplayText();
	};

	onMount(() => {
		const storedText = window.sessionStorage.getItem("displayText");
		if (storedText) {
			displayText = JSON.parse(storedText);
		}
	});
</script>

<svelte:head>
	<title>TxtReader</title>
</svelte:head>

<main on:paste={handlePaste} class='{theme}' >
	<!-- can't use bind for displayText, because we need to persist it. 
			 if we use a reactive statement for this, then it gets persistently stored as null
			 every time the component is rendered, because the initial value of displayText is null. -->
	<Menu
		on:set-display-text={onSetDisplayText}
		textLoaded={Boolean(displayText)}
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
