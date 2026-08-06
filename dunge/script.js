let posts = [];
let youtubePosts = [];

main();

const webPosts = document.getElementById("webPost");
const ytPosts = document.getElementById("youtubePost")

const dungePlaylist = `PLMcqH_XlXLMw`;
const youtubeKey = `AIzaSyD-KjEjV-eGaMM6tJA084n_d7ZncI_UT5I`; //this is safe;;;;;; restricted to https://www.isomeone.nl only

async function main() {
    await lazyGrabPosts();
    filterPosts();
    posts.reverse();
    for (let i = 0; i < posts.length; i++) {
        webPosts.innerHTML += generateWebPost(posts[i])
    }
    document.getElementsByClassName("delete1")[0].remove();
    youtubePosts = [];
    await grabYoutubePosts(0)
    youtubePosts.sort((a, b) => getTimeAsNumber(a) - getTimeAsNumber(b));
    youtubePosts.reverse();
    for (let i = 0; i < youtubePosts.length; i++) {
        ytPosts.innerHTML += generateYoutubePosts(youtubePosts[i])
    }
    document.getElementsByClassName("delete2")[0].remove();
}

function getTimeAsNumber(jsn){
    return jsn.contentDetails.videoPublishedAt.replaceAll("-","").replaceAll(":","").replaceAll("T","").replaceAll("Z","")
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

async function grabYoutubePosts(page){
    let rq;

    rq =  await fetch(`https://www.googleapis.com/youtube/v3/playlistItems
?part=snippet,contentDetails
&playlistId=${dungePlaylist}
&key=${youtubeKey}${page != 0 ? "&pageToken="+page : ``}`).then(res => res.json());

    youtubePosts = youtubePosts.concat(rq.items)

    if (rq.nextPageToken != null){
        await grabYoutubePosts(rq.nextPageToken);
    }
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

function filterPosts(){
  posts = posts.filter(post => post.toLowerCase().includes("dunge"));
}

function getUnsafe(key,values){
    key = key + ":"
    const a = values.indexOf(key) + key.length;
    values = values.substring(a);
    return values.substring(0, values.indexOf(";")).trim();
}


function generateWebPost(doc){
  return `         <div class="post"><div class="title">${getUnsafe("title",doc)}</div><div class="gray">${getUnsafe("date",doc)}</div>
         ${doc.substring(doc.indexOf("~")+1)}
         </div></div>`.replaceAll("[https://","<a href='https://").replaceAll("]yt","'>youtube link</a>")
}

function generateYoutubePosts(json){
    return `         <div class="post"><a class="title" href="https://www.youtube.com/watch?v=${json.contentDetails.videoId}"}">${json.snippet.title.substring(0,35) + (json.snippet.title.length > 35 ? "..." : "")}</a>
         <div class="gray">${getTimeAsNormal(json)}</div>
         ${json.snippet.description == "" ? "no description" : json.snippet.description}<br><br>
         </div></div>`
}

