const date = new Date();
//assume the replacers and class names are the same
const replacers = {
    age: new Date(2009,7,14),
    programmingExperience: new Date(2018,0,1),
    codingExperience: new Date(2024,0,1),
    musicExperience: new Date(2021,0,1)
}

let json;
async function fetchProjects(){
    json = parse(await (await fetch("projects.fo")).text());
    console.log(json);
}
let popups = [];
let popupElement;

const languageTag = `
<span class="language">$LANG</span>
`
const projectTile = `
<div class="project-tile" onclick="popup(popups[$ID])">
<div class="title">
$TITLE
</div>
$IMG
<div class="description">
$DESC
</div>
<span class="langs">
$LANGS
</span>
</div>
`
function languageTags(langs){
    if (langs === undefined){
        return "none";
    }
    let out = "";
    for (const lang of langs){
        out += languageTag.replace("$LANG",lang);
    }
    return out;
}
function generateTile(title, description, languages, image){
    return projectTile
        .replace("$TITLE",title)
        .replace("$DESC",description)
        .replace("$LANGS",languageTags(languages))
        .replace("$IMG", "<img class='image' src='" + image + "' alt='" + title + "'>")
        .replace("$ID", (popups.length-1).toString());
}

document.addEventListener('DOMContentLoaded', () => {main()});
let projects;

async function main(){
    const commonSuffix = "%Y years";
    replaceDate("age", "%Y-year-old");
    replaceDate("programmingExperience", commonSuffix);
    replaceDate("codingExperience", commonSuffix);
    replaceDate("musicExperience", commonSuffix);

    await fetchProjects();

    projects = document.getElementById("projects");
    popupElement = document.getElementById("popup");
    addProjects();
}

function replaceDate(replacer, text){
    const repls = document.getElementsByClassName(replacer);

    for (const repl of repls){
        const selectedDate =  replacers[replacer]

        const result = new Date(date.getTime() - selectedDate.getTime());

        repl.innerHTML = text
            .replaceAll("%Y",result.getFullYear()-1970)
            .replaceAll("%M",result.getMonth().toString());
    }
}

function parse(text){
    const out = text
        .replaceAll("\r\n","")
        .replaceAll("\r","")
        .replaceAll("\n","")
        .replaceAll("\\n","<br>")
        .replaceAll("  ","");

    return JSON.parse(out);
}

function addProjects(){
    for (const project of json){
        popups.push(project.popup);
        projects.innerHTML += generateTile(
            project.title,
            project.desc,
            project.languages,
            project.image
        );
    }
}

window.popup = popup;

window.closePopup = closePopup;
function closePopup(){
    popupElement.style.display = "none";
    document.body.style.overflowY = "auto";
}

const section = "<div class='top entry'><div class='title'>$TITLE</div>$CONTENT</div>"
const row = "<div class='imgrow'>$CONTENT</div>"

function createImageRow(images){
    let out = "";
    for (const image of images){
        out += `<img class="bigimage" alt="${image}" src="${image}">`
    }
    return row.replace("$CONTENT",out);
}

function createTextSection(title, text){
    return section
        .replace("$TITLE", title)
        .replace("$CONTENT", text);
}

function popup(json){
    const popupMain = document.getElementById("popupmain");
    popupMain.innerHTML = "";
    document.getElementById("popuptitle").innerText = json[0];
    document.getElementById("popupsubtitle").innerText = json[1];

    for (let i = 2; i < json.length; i++){
        switch (json[i].type){
            case "images":
                popupMain.innerHTML += createImageRow(json[i].data);
                break;
            case "text":
                popupMain.innerHTML += createTextSection(json[i].data[0],json[i].data[1]);
                break;
        }
    }
    popupMain.innerHTML+="<br>"
    popupElement.style.display = "";
    document.body.style.overflowY = "hidden";
}