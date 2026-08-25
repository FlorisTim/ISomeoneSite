addEventListener("DOMContentLoaded", (event) => Main());
let index = 0;
let posts = [];
let postsElement

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
    "https://lmgnsphsbfjjivyaoadq.supabase.co",
    "sb_publishable_oYu_jtRndODulzdSprQVvA_FCDe9qAn"
);

const commons = fetch("dev_docs/common.json");

const MOBILE = screen.width < 800;

let ytPosts = [];
let youtubeKey;
async function Main() {
    await lazyGrabPosts();
    posts.reverse()
    console.log(posts)
    postsElement = document.getElementsByClassName("posts")[0]
    await generate(20);
    document.getElementsByClassName("delete1")[0].innerHTML = "Load more";

    youtubeKey = (await (await commons).json()).token;
    await grabYoutubePosts(0);

    let music = document.getElementsByClassName("music")[0];

    for (let i = 0; i < ytPosts.length; i++) {
        music.innerHTML += generateYoutubePosts(ytPosts[i]);
    }

    document.getElementsByClassName("delete2")[0].remove();
}

async function likeButtons(id) {
    id = -id + posts.length;
    const voted = localStorage.getItem("voted" + id) !== null;
    const { data } = await supabase
        .from("Post Votes")
        .select("thumbsup, thumbsdown")
        .eq("id", id)
        .maybeSingle();

    const down = data?.thumbsdown ?? 0;
    const up = data?.thumbsup ?? 0
    return `
     <div class="inline">
                <div class="column">
                <div class="interaction">
                    <svg class="arrow ${voted ? '' : 'arrowUp'}" ${voted ? '' : 'onclick="like(' + id + ')"'}viewBox="0 0 8.544 10.716">
                        <path fill="currentColor" d="M4.272 0l4.272 4.395H5.72v6.321H2.824V4.395H0z"/>
                    </svg>
                 
                </div>
                </div>
                   <div class="forcerow text85" title="${Math.abs(up-down)} people ${down > up ? "dis": ""}liked this">${up-down}</div>
                <div class="column">
                <div class="interaction">
                    <svg viewBox="0 0 8.544 10.716" class="arrow ${voted ? '' : 'arrowDown '}" ${voted ? '' : 'onclick="disLike(' + id + ')"'} >
                        <path fill="currentColor" d="M0 6.321h2.824V0h2.896v6.321h2.824L4.272 10.716z"/>
                    </svg>
                </div>
                
                </div>
            </div>
    `
}

window.like = like;
window.disLike = disLike;

async function like(id){
    localStorage.setItem("voted" + id, "true");
    const { data, error } = await supabase.from("Post Votes").select("id, thumbsup").eq("id",id).maybeSingle();
    if (data){
        await supabase.from("Post Votes").update({thumbsup: data.thumbsup + 1}).eq("id",id);
    } else {
        await supabase.from("Post Votes").insert({
            id: id,
            thumbsup: 1,
            thumbsdown: 0
        })
    }
    await refreshPost(id);
}

async function disLike(id){
    localStorage.setItem("voted" + id, "true");
    const { data, error } = await supabase.from("Post Votes").select("id, thumbsdown").eq("id",id).maybeSingle();
    if (data){
        await supabase.from("Post Votes").update({thumbsdown: data.thumbsdown + 1}).eq("id",id);
    } else {
        await supabase.from("Post Votes").insert({
            id: id,
            thumbsup: 0,
            thumbsdown: 1
        })
    }
    await refreshPost(id);
}

async function generate(amount){
    for (let i = 0; i < amount; i++){
        postsElement.innerHTML += await parseDoc(posts[index],index);
        index++;
        if (index >= posts.length){
            document.getElementsByClassName("delete1")[0].remove()
            postsElement.innerHTML += `<div class="center graytext">You have reached the end</div>`;
        }
    }
}

async function refreshPost(id){
    id = -id + posts.length;
    document.getElementById("post_"+id).innerHTML = await parseDoc(posts[id],id);
}

async function lazyGrabPosts(){
    let count = 1;
    posts = [];
    while(true){
        let out = await fetch("https://isomeone.nl/posts/post_"+count+".html");
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

async function generatePost(Date, Title, Classes, Contents, MetaData, index) {
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
    return `<div id="post_${index}"><div class="entry post column">
        <div class="title">${Title}
            <div class="graytext">${Date}</div>
        </div>

        <div class="entry ${Classes}">
            ${Contents}
        </div>
        ${await likeButtons(index)}
    </div></div>`
}

window.generate = generate;
window.index = index;

async function parseDoc(Document,index){
    return await generatePost(
        getUnsafe("date", Document),
        getUnsafe("title",Document),
        getUnsafe("class",Document),
        Document.substring(Document.indexOf("~")+1),
        Document.substring(0,Document.indexOf("~")),
        index
    );
}

function getUnsafe(key,values){
    key = key + ":"
    const a = values.indexOf(key) + key.length;
    values = values.substring(a);
    return values.substring(0, values.indexOf(";")).trim();
}

function openWindow(url){
    const w = 700;
    const h = 500;

    const l = (screen.width - w) / 2;
    const r = (screen.height - h) / 2;

    window.open(url,"gift",
        `width=${w},height=${h},top=${r},left=${l},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`)
}

window.openWindow = openWindow;

function generateYoutubePosts(json){
    return `         
         
         <div class="post">
                 <a class="title" href="https://www.youtube.com/watch?v=${json.contentDetails.videoId}">
                ${json.snippet.title}
                </a>
            <div class="graytext">
                ${getTimeAsNormal(json)}
            </div><br>
         </div>`
}

const playlistID = "PLXZT--l9jSF4";

async function grabYoutubePosts(page){

    let rq =  await fetch(`https://www.googleapis.com/youtube/v3/playlistItems
?part=snippet,contentDetails
&playlistId=${playlistID}
&key=${youtubeKey}${page !== 0 ? "&pageToken="+page : ``}`).then(res => res.json());

    let error = rq.error;

    if (error !== undefined) {
        document.getElementsByClassName("delete2")[0].innerText = "failed to load yt videos: " + error.status.toLowerCase().replaceAll("_", " ");
        document.getElementsByClassName("delete2")[0].classList.remove("delete2");
    }
    console.log(error);
    console.log(rq);

    ytPosts = ytPosts.concat(rq.items)

    if (rq.nextPageToken != null){
        await grabYoutubePosts(rq.nextPageToken);
    }
}

function getTimeAsNumber(jsn) {
    if (jsn.contentDetails.videoPublishedAt === undefined) {
        return "undefined time";
    }
    return jsn.contentDetails.videoPublishedAt.replaceAll("-", "").replaceAll(":", "").replaceAll("T", "").replaceAll("Z", "")
}

function getTimeAsNormal(jsn){
    const out = jsn.contentDetails.videoPublishedAt
        .replaceAll("-","/")
        .replaceAll(":",":")
        .replaceAll("T"," - ")
        .replaceAll("Z","")
    return out.substring(0,out.lastIndexOf(":"))
        .replaceAll("/01/"," January ")
        .replaceAll("/02/"," February ")
        .replaceAll("/03/"," March ")
        .replaceAll("/04/"," April ")
        .replaceAll("/05/"," May ")
        .replaceAll("/06/"," June ")
        .replaceAll("/07/"," July ")
        .replaceAll("/08/"," August ")
        .replaceAll("/09/"," September ")
        .replaceAll("/10/"," October ")
        .replaceAll("/11/"," November ")
        .replaceAll("/12/"," December ")

}