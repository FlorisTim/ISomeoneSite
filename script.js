addEventListener("DOMContentLoaded", (event) => Main());



async function Main() {
    const posts = document.getElementsByClassName('ytvids')[0];
    const result = await fetch("/youtube.xml").then(res => res.text());
    const xml = new DOMParser().parseFromString(result, "application/xml");
    let entries = xml.querySelectorAll("entry");
    entries = [...entries];

    for (let i = 0; i < (window.screen.width < 900 ? 1 : 2); i++) {
        let entry = entries[i];
        posts.innerHTML += (`${generateYTEmbed(entry.querySelectorAll("id")[0].textContent)}`);
    }
    if(window.screen.width < 900){
        document.getElementsByClassName("replacement")[0].innerText = "Latest youtube video"
    }
}

function generateYTEmbed(link) {
    if (link.includes("/")){
        link = link.substring(link.lastIndexOf("/") + 1);
    }
    if (link.includes(":")){
        link = link.substring(link.lastIndexOf(":") + 1);
    }
    if (link.includes("v=")){
        link = link.substring(link.lastIndexOf("v=") + 1);
    }
    return `<iframe src="https://www.youtube.com/embed/${link}"
                   title="YouTube video player"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                   referrerPolicy="strict-origin-when-cross-origin"
                   allowFullScreen></iframe>`
}