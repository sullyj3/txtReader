<script lang="ts">
	import type { DisplayText } from "./types";

	export let menuDisplayText: DisplayText;
	export let menuShouldJoinLines: boolean;

	let files: FileList;
	let fileInput: HTMLInputElement;

	$: {
		const selectedFile = files && files[0] ? files[0] : null;
		if (selectedFile) {
			updateDisplayTextFile(selectedFile);
		}
	}

	const updateDisplayTextFile = async (f: File) => {
		menuDisplayText = {
			type: "FileText",
			fileName: f.name,
			text: await f.text(),
		};
	};

	const clear = () => {
		menuDisplayText = null;
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
	{#if menuDisplayText}
		<button on:click={clear}>Clear</button>
		<div id="join-lines">
			<label for="join-lines">Join lines</label>
			<input type="checkbox" bind:checked={menuShouldJoinLines} />
		</div>
	{/if}
</div>
