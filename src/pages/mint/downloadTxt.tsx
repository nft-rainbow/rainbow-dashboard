import React from "react";

export function DownloadText({content, filename, label}:{content:string, filename:string, label:string}) {
    const myFile = new Blob([content], {type: 'text/plain',});
    const URL = window.URL || window.webkitURL;
    const obj = URL.createObjectURL(myFile);
    return (
        <a href={obj} download={filename}>{label}</a>
    )
}