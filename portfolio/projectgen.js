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

function Write(input){


    let newhtml = '';
    if (input.Type != 1) {
        newhtml += ` <h3>${input.Title}</h3>`;
    } else {
        newhtml += `<video controls="" src="${input.Source}"></video><br>`;
    }

    const periodPerYear = 4;
    const periodPerStudy = 16;

    let periodtext = `[`
    let opleidingen = ["MBO ", "HBO ", "UNI "]
    let period = input.Period;
    if (period < 128 && period > 0){
        periodtext += `${opleidingen[Math.floor(period/periodPerStudy)]} `;
        periodtext += ` Year ${Math.floor(period/periodPerYear)+1}, `;
        periodtext += `Period `;
    }
    periodtext += `${period}`;

    if (period < 128 && period > 0){periodtext += `] [${2026 + Math.floor(period/4)}`;}
    periodtext += `]`;
    periodtext = periodtext.replace("[0]", "");

    newhtml += `<p class="graytext">${periodtext}</p>`;
    newhtml += `<p>${input.Description}</p>`;


    if (input.Type != 1) {
        let details = ``
        if (input.Details?.length > 0) {
            details += `<details>`

            let importedDetails = input.Details;
            for (let j = 0; j < importedDetails.length; j++) {

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
        if (input.Type == 2) {
            let embed = input.Embed;
            newhtml += `<div class = "embedded"><iframe loading="lazy" src="${embed}" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen=""></iframe></div>`;
        } else
        {
            let images = input.Images;
            if (images.length > 0) {
                newhtml += `<div class="row">`
                images.forEach(image => {
                    newhtml += `<div class="rentry">`;
                    newhtml += `<img src="${image}">`;
                    newhtml += `</div>`;
                })
                newhtml += `</div>`
            }
        }
        let suffix = input.Suffix;
        let linkIndex = 0;
        while (suffix.includes("+link")) {
            suffix = suffix.replace("+link", `<a href="${input.Links[linkIndex].Url}">${input.Links[linkIndex].Text}</a>`);
            linkIndex++;
        }
        newhtml += `<p>${suffix}</p>`
        newhtml += details;
    }




    let name = input.Name;

    let edit = document.getElementsByClassName("project_" + name);



    for (let j = 0; j < edit.length; j++){
        edit[j].innerHTML = newhtml;
    }
}
