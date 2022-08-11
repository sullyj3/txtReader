<script lang="ts">
import Menu from './Menu.svelte';
import * as types from './types';

let displayText: DisplayText = null;
let shouldJoinLines: boolean = false;

const joinLines = txt => {
	const paragraphs = txt.split(/\n\n+/);
	return paragraphs.map(para => para.replaceAll(/ *\n/g, " "))
									 .join("\n\n");
}

const handlePaste = ev => {
	ev.preventDefault();
	displayText = {
	 type: "Pasted",
	 text: ev.clipboardData.getData("text")
	};
}

</script>

<main on:paste={handlePaste}>
	<Menu bind:menuDisplayText={displayText} bind:menuShouldJoinLines={shouldJoinLines} />
  <div id="body">
		{#if displayText && displayText.type === "FileText"}
			<h1 id="filename">{@html displayText.fileName}</h1>
		{/if}
		{#if displayText}
			<pre id="text">
				{shouldJoinLines ? joinLines(displayText.text) : displayText.text }
			</pre>
		{/if}
  </div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
