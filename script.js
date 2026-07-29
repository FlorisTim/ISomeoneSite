addEventListener("DOMContentLoaded", (event) => Main());
let index = 0;
let posts = [];
let postsElement

const MOBILE = screen.width < 800;

async function Main() {
    await lazyGrabPosts();
    posts.reverse();
    console.log(posts)
    postsElement = document.getElementsByClassName("posts")[0]
    generate(2);
}

function generate(amount){
    for (let i = 0; i < amount; i++){
        postsElement.innerHTML += parseDoc(posts[index]);
        index++;
        if (index >= posts.length){
            document.getElementsByClassName("delete1")[0].remove()
            postsElement.innerHTML += `<div class="center graytext">You have reached the end</div>`;
        }
    }
}

async function lazyGrabPosts(){
    let count = 1;
    posts = [];
    while(true){
        let out = await fetch("/posts/post_"+count+".html");
        if (out.ok){
            posts.push(await out.text());
            count++;
        } else{
            break;
        }
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

function generatePost(Date, Title, Classes, Contents, MetaData) {
    if (!MOBILE){
        Contents =             Contents.replaceAll("[https://www.youtube.com/watch?v=","<iframe src=\"https://www.youtube.com/embed/")
            .replaceAll("]yt",`\" title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen></iframe>`)
    } else {
        let i = 1;
        while (Contents.includes("[https://www.youtube.com/watch?v=")){
            Contents = Contents
                .replace("[https://www.youtube.com/watch?v=","<a href='https://www.youtube.com/watch?v=")
                .replace("]yt",`'>${getUnsafe("yt_title_" + i,MetaData)}</a>`)
            i++;
        }

    }
    return `<div class="entry post column">
        <div class="title">${Title}
            <div class="graytext">${Date}</div>
        </div>

        <div class="entry ${Classes}">
            ${Contents}
        </div>
    </div>`
}


function parseDoc(Document){
    return generatePost(
        getUnsafe("date", Document),
        getUnsafe("title",Document),
        getUnsafe("class",Document),
        Document.substring(Document.indexOf("~")+1),
        Document.substring(0,Document.indexOf("~"))
    );
}

function getUnsafe(key,values){
    key = key + ":"
    const a = values.indexOf(key) + key.length;
    values = values.substring(a);
    return values.substring(0, values.indexOf(";")).trim();
}