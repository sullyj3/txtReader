<script lang="ts">
	import type { DisplayText, MenuSetDisplayTextEvent, FileText } from "./types";
	import { createEventDispatcher } from "svelte";

	export let menuShouldJoinLines: boolean;
	export let darkMode: boolean = false;
	export let textLoaded: boolean = false;

	let files: FileList;
	let fileInput: HTMLInputElement;

	$: {
		const selectedFile = files && files[0] ? files[0] : null;
		if (selectedFile) {
			updateDisplayTextFile(selectedFile);
		}
	}

	const dispatch = createEventDispatcher();

	const updateDisplayTextFile = async (f: File) => {
		const menuDisplayText: FileText = {
			type: "FileText",
			fileName: f.name,
			text: await f.text(),
		};
		dispatch("set-display-text", { type: "MenuSetDisplayTextEvent", displayText: menuDisplayText });
	};

	const clear = () => {
		// menuDisplayText = null;
		dispatch("set-display-text", { type: "MenuSetDisplayTextEvent", displayText: null });
		files = null;
		fileInput.value = null;
	};
</script>

<div id="menu">
	<span>
		<input
			type="file"
			name="choose file"
			bind:files
			bind:this={fileInput}
		/>
		<p>(Or press ctrl-V)</p>
	</span>
	<div id="theme-toggle">
		<label for="theme-toggle">Dark mode</label>
		<input type="checkbox" bind:checked={darkMode} />
	</div>
	{#if textLoaded}
		<button on:click={clear}>Clear</button>
		<div id="join-lines">
			<label for="join-lines">Join lines</label>
			<input type="checkbox" bind:checked={menuShouldJoinLines} />
		</div>
	{/if}
</div>
