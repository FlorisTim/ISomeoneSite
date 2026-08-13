
let documentBody;
let documentHead;
let source
let commons

async function load(){
    documentBody = document.getElementsByTagName("body")[0]
    documentHead = document.getElementsByTagName("head")[0]
    source = await fetch("/dev_docs/common.json")
    commons = JSON.parse(await (await source).text());
}

let webPosts = false;
let youtubePosts = false;

let youtubeToken = null;
let playlist = null;

let infos = false;
let plans = false;

let trim = false;

let cssTemplate = `
.gray{
  color:$1;
}
th{
    background-color: $3;
}
td, .post{
  background-color: $5;
}
kbd{
  background-color: $4;

}
.spckbd kbd {
    background: linear-gradient(90deg, $4 0%, rgba(0, 0, 0, 0) 100%);
    border: 1px solid $4 ;
}
body{
    background-color: $2;
}
.sub {
    background-color: $3;
}
a, .qlink{
    color: $0;
}
a:hover, .qlink:hover{
    color:$1;
}
.post .title, .post_section{
    background-color:$4;
}
*{
    scrollbar-color: $4 $3;
}`

let subs = [0,1,8,9,10,11];

let filter = "";

async function act(path){
    await load();

    documentBody.innerHTML = await parse(path);
    documentBody.innerHTML += `<style>${cssTemplate}</style>`;

    console.log(documentBody.innerHTML);

    await main(youtubeToken,playlist,plans,webPosts,youtubePosts)
}
const hex = "0123456789abcdef";
async function parseMetadata(header){
    for (let i = 0; i < header.length; i++) {
        switch (header[i].trim()) {
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
            case "webPostsFilter":
                filter = read(i);
                break;
            case "theme":
                const theme = read(i).trim().split(" ");
                for (let j = 0; j < subs.length; j++) {
                    cssTemplate = cssTemplate.replaceAll("$"+j, hexCode(theme, subs[j]));
                }
                break;
            case "title":
                documentHead.innerHTML += `<title>${read(i)}</title>`;
                break;
            case "themeSubtractions":
                subs = read(i).trim().split(" ");
                break;
        }
    }

    function hexCode(theme,index){
        let red = theme[0]
        let green = theme[1]
        let blue = theme[2]

        red -= index;
        green -= index;
        blue -= index;

        red = Math.max(red, 0);
        green = Math.max(green, 0);
        blue = Math.max(blue, 0);
        console.log(`#${index} = #${hex[red]}${hex[green]}${hex[blue]}`)
        return `#${hex[red]}${hex[green]}${hex[blue]}`
    }

    function read(i){
        i++
        if (header[i++].trim() === "in_commons"){
            return commons[header[i++].trim()];
        } else {
            return header[--i].trim();
        }
    }
}

async function parse(path){
    let inputDocument = await (await fetch(path)).text();
    const sections = inputDocument.split("----");
    let data = sections[1];
    console.log(sections);
    await parseMetadata(sections[0].replaceAll("\n","\r\n").split("\r\n"));
    if (trim){
        data = data.trim();
    }
    const dataSplit = data.replaceAll("\n","\r\n").split("\r\n");

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