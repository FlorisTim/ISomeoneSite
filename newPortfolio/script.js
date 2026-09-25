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
    json = parseJSFON(await (await fetch("projects.jsfon")).text());
}
let popups = [];

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
        .replace("$ID", popups.length.toString());
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
    addProjects();
}

function replaceDate(replacer, text){
    const repls = document.getElementsByClassName(replacer);

    for (const repl of repls){
        const selectedDate =  replacers[replacer]

        const result = new Date(date.getTime() - selectedDate.getTime());

        repl.innerHTML = text
            .replaceAll("%Y",result.getFullYear()-1970)
            .replaceAll("%M",result.getMonth());
    }
}

function parseJSFON(text){
    return JSON.parse(text
        .replaceAll("\n","")
        .replaceAll("\\n","<br>")
        .replaceAll("  ","")
    )
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