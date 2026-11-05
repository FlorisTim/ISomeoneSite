const date = new Date();
//assume the replacers and class names are the same
const replacers = {
    age: new Date(2009,7,14),
    programmingExperience: new Date(2018,0,1),
    codingExperience: new Date(2024,0,1),
    musicExperience: new Date(2021,0,1)
}

let json;
async function fetchProjects(path){
    json = parse(await (await fetch(path)).text());
    console.log(json);
}
let popups = [];
let popupElement;


const languageTag = `
<span class="language">$LANG</span>
`
const projectTile = `
<div class="project-tile" onclick="popup(popups[$ID])">
<div class="title left">
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
        .replace("$TITLE",title.replaceAll("[","<span class='tag'>").replaceAll("]","</span>"))
        .replace("$DESC",description)
        .replace("$LANGS",languageTags(languages))
        .replace("$IMG", "<img class='image' src='" + image + "' alt='" + title + "'>")
        .replace("$ID", (popups.length-1).toString());
}

document.addEventListener('DOMContentLoaded', () => {main()});
let projects;
let musicProjects;

async function main(){
    const commonSuffix = "%Y years";
    replaceDate("age", "%Y-year-old");
    replaceDate("programmingExperience", commonSuffix);
    replaceDate("codingExperience", commonSuffix);
    replaceDate("musicExperience", commonSuffix);

    popupElement = document.getElementById("popup");

    await fetchProjects("projects.json");
    projects = document.getElementById("projects");
    addProjects(projects, `<span class="tag2">&lt/&gt</span>`);

    await fetchProjects("music_projects.json");
    musicProjects = document.getElementById("projects");
    addProjects(musicProjects, `<span class="tag2">♫♪</span>`);
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

    return JSON.parse(`[${out}]`).reverse();
}

function addProjects(projectsElement, prefix){
    for (const project of json){
        popups.push(project.popup);
        projectsElement.innerHTML += generateTile(
            prefix + project.title,
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
    location.reload();
}

const section = "<div class='top entry'><div class='title'>$TITLE</div>$CONTENT</div>"
const row = "<div class='imgrow'>$CONTENT</div>"

function createImageRow(images, big){
    let out = "";
    for (const image of images){
        out += `<img class="${big ? "singular" : "bigimage"}" alt="${image}" src="${image}">`
    }
    return row.replace("$CONTENT",out);
}

function createTextSection(title, text){
    return section
        .replace("$TITLE", title)
        .replace("$CONTENT", text);
}

console.log()

function createAudio(id){
    return`
<audio id="player${id[0]}" src="${id[0]}"></audio>
<div class="audio"> 
  <button onclick="start('${id[0]}')" id='g${id[0]}'>Play</button> 
  <button style="display: none" onclick="stop('${id[0]}')" id='s${id[0]}'>Pause</button>

  <div class="title flex1 column-row">
  <span class="forcerow info">
  <span class="timetext" id="time${id[0]}">_:__ / _:__</span>${id[1]}</span>
  <div class="bar">
  <input type="range" step="0.01" id="display${id[0]}" value="0" class="fill">
  </div>

</div>

`;
}

function popup(json) {
    if (json[0] === "devdoc") {
        const url = new URL(`/dev_docs/${json[1]}`, window.location.origin);
        url.searchParams.set("source", "portfolio");
        window.location.href = url.toString();
        return;
    }
    const popupMain = document.getElementById("popupmain");
    popupMain.innerHTML = "";
    document.getElementById("popuptitle").innerText = json[0];
    document.getElementById("popupsubtitle").innerText = json[1];

    for (let i = 2; i < json.length; i++) {
        switch (json[i].type) {
            case "images":
                popupMain.innerHTML += createImageRow(json[i].data, false);
                break;
            case "image":
                popupMain.innerHTML += createImageRow(json[i].data, true);
                break;
            case "audio":
                popupMain.innerHTML += createAudio(json[i].data);
                document.getElementById(`display${json[i].data[0]}`).value = 80;
                window.setInterval(function () {
                    const el = document.getElementById(`player${json[i].data[0]}`)
                    const tm = document.getElementById(`time${json[i].data[0]}`)
                    const disp = document.getElementById(`display${json[i].data[0]}`);
                    const pel = document.getElementById(`g${json[i].data[0]}`);

                    if (pel.style.display == "none" && el.paused) {
                        stop(`${json[i].data[0]}`);
                        el.currentTime = 0;
                        disp.value = 0;
                    }

                    if (Math.abs(disp.value - 100 / el.duration * el.currentTime) > 1) {
                        if (disp.value != 50){
                            el.currentTime = el.duration/100 * disp.value;
                        }
                    }
                    tm.innerHTML = formatTime(Math.round(el.currentTime)) + " / " + formatTime(Math.round(el.duration));
                    disp.value = (100 / el.duration * el.currentTime);


                }, 10);

                break;
            case "text":
                popupMain.innerHTML += createTextSection(json[i].data[0], json[i].data[1]);
                break;
        }
    }
    popupMain.innerHTML += "<br>"
    popupElement.style.display = "";
    document.body.style.overflowY = "hidden";
}

function start(id){
    const el = document.getElementById(`player${id}`)
    el.play();
    check(id)
}

function stop(id){
    const el = document.getElementById(`player${id}`)
    el.pause();
    check(id)
}

function check(id){
    const play = document.getElementById(`g${id}`);
    const stop = document.getElementById(`s${id}`);
    const el = document.getElementById(`player${id}`)
    if (!el.paused) {
        play.style.display = "none";
        stop.style.display = "";
    } else {
        play.style.display = "";
        stop.style.display = "none";
    }
}

function formatTime(value){
    let seconds = value % 60;
    if (seconds < 10){
        seconds = "0" + seconds;
    }
    const out = (((value / 60) | 0) + ":" + seconds).toString();
    return out;
}