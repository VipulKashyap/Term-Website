var fileDB = [
	{
		name: "about_me.txt",
		prog: "cat",
		type: "file"
	},
	{
		name: "resume.pdf",
		prog: "pdfview",
		type: "file"
	},
	{
		name: "Projects",
		prog: "cd",
		type: "dir",
		data: [
			{
				name: "resume.pdf",
				prog: "pdfview",
				type: "file"				
			}
		]
	}
];