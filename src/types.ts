export type Pasted = {
	type: "Pasted";
	text: string;
}

export type FileText = {
	type: "FileText";
	fileName: string;
	text: string;
}

export type DisplayText = Pasted | FileText | null

export type Theme = "lightTheme" | "darkTheme"
