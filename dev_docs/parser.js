
let documentBody;
let source
let commons
async function load(){
    documentBody = document.getElementsByTagName("body")[0]
    source = await fetch("../common.json")
    commons = JSON.parse(await (await source).text());
}

let webPosts = false;
let youtubePosts = false;

let youtubeToken = null;
let playlist = null;

let infos = false;
let plans = false;

let trim = false;

async function act(path){
    await load();

    documentBody.innerHTML = await parse(path);

    await main(youtubeToken,playlist,plans,webPosts,youtubePosts)
}

async function parseMetadata(header){
    for (let i = 0; i < header.length; i++) {
        switch (header[i]) {
            case "webPosts":
                webPosts = true;
                break;
            case "youtubePosts":
                youtubePosts = true;
                break;
            case "infos":
                infos = true;
                break;
            case "plans":
                plans = true;
                break;
            case "trimFile":
                trim = true;
                break;
            case "playlist":
                playlist = read(i);
                break;
            case "youtubeToken":
                youtubeToken = read(i);
                break;
        }
    }
    function read(i){
        i++
        if (header[i++] === "in_commons"){
            return commons[header[i++]];
        } else {
            return header[--i];
        }
    }
}

async function parse(path){
    let inputDocument = await (await fetch(path)).text();
    const sections = inputDocument.split("----");
    let data = sections[1];
    console.log(sections);
    await parseMetadata(sections[0].split("\r\n"));
    if (trim){
        data = data.trim();
    }
    const dataSplit = data.split("\r\n");

    let output = `<div class="main">`

    for (let i = 0; i < dataSplit.length; i++) {
        const firstTrim = dataSplit[i].trim()[0];
        const currentTrim = dataSplit[i].trim();

        const classes = currentTrim.includes("(") ? currentTrim.substring(2, currentTrim.indexOf(")")) : "";
        const ids = currentTrim.includes(")<") ? currentTrim.substring(currentTrim.indexOf(")") + 2, currentTrim.indexOf(">")) : "";
        const content = (ids === "" ? currentTrim.substring(currentTrim.indexOf(")") + 1) : currentTrim.substring(currentTrim.indexOf(">") + 1)).trim();

        if (dataSplit[i][0] === "\n") {
            output += `<br>`;
        } else if (firstTrim === "#") {
            output += `<div class="${classes}" id="${ids}">${content}</div>`;
        } else if (firstTrim === "{") {
            output += `<div class="sub ${classes}" id="${ids}">`;
        } else if (firstTrim === "[") {
            output += `<div class="row ${classes}" id="${ids}">`;
        } else if ("]}".includes(firstTrim) || currentTrim === "!#") {
            output += `</div>`;
        } else if (firstTrim === "!") {
            output += `<div class="${classes}" id="${ids}">`;
        } else {
            output += currentTrim;
        }
    }

    return output + `</div>`;
}