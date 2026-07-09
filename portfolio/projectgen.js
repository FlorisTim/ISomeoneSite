addEventListener("DOMContentLoaded", (event) => Main());

let projects;

async function Main(){
    await GrabProjects();
    for (let i=0; i<projects.length; i++){
        Write(projects[i]);
    }


}

async function GrabProjects(){
    const response = await fetch("./projects.json");
    projects = await response.json();


}

function GenerateDetailsElement(Details){
    let details = ``
    if (Details?.length > 0) {
        let importedDetails = Details;
        details += `<details ${importedDetails[0][0] === "$open_in_home" && window.location.pathname.includes("index.html") ? "open" : ""}>`


        for (let j = 0; j < importedDetails.length; j++) {
            if (importedDetails[j][0].includes("$")) {continue;}
            details += `<div class = "projectcontainer">`;

            for (let i = 0; i < importedDetails[j].length; i++) {

                let thisthing = importedDetails[j][i];
                if (thisthing.includes("resources/")) {
                    details += `<img src="${thisthing}">`;
                } else {
                    details += `<p>${thisthing}</p>`;
                }

            }
            details += `<br></div>`;
        }


        details += `</details>`
    }
    return details;
}
function GeneratePeriodElement(period){
    const periodPerYear = 4;
    const periodPerStudy = 16;
    const yearsPerStudy = 4;

    let periodtext = `[`
    const opleidingen = ["MBO ", "HBO ", "UNI "]
    if (period < 128 && period > 0){
        period -= 1;
        periodtext += `${opleidingen[Math.floor(period/periodPerStudy)]} `;
        periodtext += ` Year ${(Math.floor(period/periodPerYear)%yearsPerStudy)+1}, `;
        periodtext += `Period `;
    }
    periodtext += `${(period%periodPerYear)+1}`;

    if (period < 128 && period > 0){periodtext += `] [${2026 + Math.floor(period/periodPerYear)}`;}
    periodtext += `]`;
    periodtext = periodtext.length < 4 ? `[${period}]` : periodtext;

    return `<p class="graytext">${periodtext}</p>`;
}
function GenerateImageRowElement(images){
    let output = ``;
    if (images.length > 0) {
        output += `<div class="row">`
        images.forEach(image => {
            output += `<div class="rentry">`;
            output += `<img src="${image}">`;
            output += `</div>`;
        })
        output += `</div>`
    }
    return output;
}
function GenerateEmbedElement(embed){
    return `<div class = "embedded"><iframe loading="lazy" src="${embed}" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen=""></iframe></div>`;
}
function GenerateSuffixElement(suffix, links){
    let linkIndex = 0;
    while (suffix.includes("+link")) {
        suffix = suffix.replace("+link", `<a href="${links[linkIndex].Url}">${links[linkIndex].Text}</a>`);
        linkIndex++;
    }
    return `<p>${suffix}</p>`;
}

function Write(input){


    let newhtml = '';


    if (input.Type != 1) {
        newhtml += ` <h3>${input.Title}</h3>`;
    } else {
        newhtml += `<video controls="" src="${input.Source}"></video><br>`;
    }

    newhtml += GeneratePeriodElement(input.Period);
    newhtml += `<p>${input.Description}</p>`;


    if (input.Type != 1) {

        if (input.Type == 2) {
            newhtml += GenerateEmbedElement(input.Embed);
        } else
        {
            newhtml += GenerateImageRowElement(input.Images)
        }

        newhtml += GenerateSuffixElement(input.Suffix,input.Links)
        newhtml += GenerateDetailsElement(input.Details);
    }




    const name = input.Name;

    const edit = document.getElementsByClassName("project_" + name);



    for (let j = 0; j < edit.length; j++){
        edit[j].innerHTML = newhtml;
    }
}
