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

export function downloadFile(fileName: string, content: string, type = 'text/plain') {
    const aElement = document.createElement('a');
    aElement.setAttribute('download', fileName);
    const href = URL.createObjectURL(new Blob([content], {type}));
    aElement.href = href;
    aElement.setAttribute('target', '_blank');
    aElement.click();
    URL.revokeObjectURL(href);
}