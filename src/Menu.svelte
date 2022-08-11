<script lang="ts">
import * as types from './types';

export let menuDisplayText: DisplayText;
export let menuShouldJoinLines: Boolean;

let files;
$: {
	const selectedFile = files && files[0] ? files[0] : null;
	if (selectedFile) {
		updateDisplayTextFile(selectedFile);
	}
}

async function updateDisplayTextFile(f) {
	menuDisplayText = {
		type: "FileText",
		fileName: f.name,
		text: await f.text()
	};
}

</script>

<div id="menu">
	<div>
		<input type="file" name="choose file" bind:files> <p>(Or press ctrl-V)</p> 
	</div>
	{#if menuDisplayText }
		<button on:click={() => {menuDisplayText = null} }>Clear</button>
		<div id="join-lines">
			<label for="join-lines">Join lines</label>
			<input type="checkbox" bind:checked={menuShouldJoinLines}>
		</div>
	{/if}
</div>
