import React from "react";

export interface TextDownloaderOpts {
    content: string;
    filename: string;
    label: string; 
    type?: string;
}

export function TextDownloader({content, filename, label, type = 'text/plain'}: TextDownloaderOpts) {
    const myFile = new Blob([content], {type});
    const URL = window.URL || window.webkitURL;
    const obj = URL.createObjectURL(myFile);
    return (
        <a href={obj} download={filename}>{label}</a>
    )
}