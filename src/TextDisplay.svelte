<script lang="ts">
import type { DisplayText } from './types';

export let displayText: DisplayText;
export let shouldJoinLines: boolean;
let text: string;
$: if (displayText) {
	text = shouldJoinLines ? joinLines(displayText.text) : displayText.text 
}

function joinParagraphLines(para: string): string {
	return para.replaceAll(/\s*(\r\n?|\n)/g, " ");
}
function containsNonWhitespace(s: string): boolean {
	return s.trim().length > 0;
}

const joinLines: (txt: string) => string = txt => {
	const paragraphs = txt.split(/(\r\n|\n)(\r\n?|\n)+/);
	return paragraphs.map(joinParagraphLines)
									 .filter(containsNonWhitespace)
									 .join("\n\n"); 
}
</script>

<div id="text-display">
	{#if displayText && displayText.type === "FileText"}
		<h1 id="filename">{@html displayText.fileName}</h1>
	{/if}
	{#if displayText}
		<pre id="text">{text}</pre>
	{/if}
</div>

<style>
	h1 {
		color: #ff3e00;
		font-size: 4em;
		font-weight: 100;
	}

	#text-display {
		width: 35em;
		margin-left: auto;
		margin-right: auto;
	}

	#text {
		word-wrap: break-word;
		white-space: pre-wrap;
		font-family: serif;
		font-size: 1.15em;
		line-height: 1.4em;
	}
</style>
