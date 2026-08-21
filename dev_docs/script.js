let posts = [];
let youtubePost = [];

let webPostsElement;
let ytPosts;

let playlistID;
let youtubeKey; //this is safe; restricted to https://www.isomeone.nl only

let mainloader = null;

async function main(yttoken, plalst, future, webpsts, ytpsts) {
    console.log(plalst);
    console.log(future);
    console.log(webpsts);
    console.log(ytpsts);
    webPostsElement = document.getElementById("webPost");
    ytPosts = document.getElementById("youtubePost");
    await loadInformation("startInfo",0)

    youtubeKey = yttoken;
    playlistID = plalst;
    if (future){
        await loadInformation("startInfo",1)
    }

    if (webpsts){
        await lazyGrabPosts();
        filterPosts();
        posts.reverse();
        for (let i = 0; i < posts.length; i++) {
            webPostsElement.innerHTML += generateWebPost(posts[i])
        }
        document.getElementsByClassName("delete1")[0].remove();
    }

    if (ytpsts) {
        document.getElementsByClassName("delete2")[0].remove();
        youtubePost = [];
        await grabYoutubePosts(0)
        youtubePost.sort((a, b) => getTimeAsNumber(a) - getTimeAsNumber(b));
        youtubePost.reverse();
        for (let i = 0; i < youtubePost.length; i++) {
            try {
                ytPosts.innerHTML += generateYoutubePosts(youtubePost[i])
            } catch (e){
                console.error(e);
            }
        }
    }
}





async function loadInformation(name,id){
    mainloader = document.getElementById("LOADER"+ id);
    let a = await fetch((id == 0 ? "./infos/" : "./plans/") + name + ".html")
    a = (await a.text())
        .replaceAll("\\[","OPENSQUARE").replaceAll("\\]", "CLOSESQUARE")
        .replaceAll("[\"back\"]","[\"qlink title\" onclick=\"loadInformation('startInfo')\"]Back[/]")
        .replaceAll("[/]", "</div>")
        .replaceAll("[","<div class=").replaceAll("]",">")
        .replaceAll("    ","<span class='tab'></span>")
        .replaceAll("OPENSQUARE","[").replaceAll("CLOSESQUARE","]");
    for (let i = 0; i < a.length; i++) {
        if (a.substring(i).startsWith("onclick=\"loadInformation('")){
            a = a.substring(0,i) + a.substring(i).replace("')",`',${id})`);
        }
    }
    let inkbd = false;

    let chars = a.split('');
    for (let i = 0; i < a.length; i++) {
        if (a.substring(i).startsWith("<kbd>")){
            inkbd = true;
        }
        if (a.substring(i).startsWith("</kbd>")){
            inkbd = false;
        }

        if (a[i] === '\n' && inkbd){
            chars[i] = "~";
        }
    }


    a = chars.join('');
    a = a.replaceAll("~","<br>");

    keywords("functions")
    keywords("types")
    keywords("values")

    function keywords(t){
        for (let i = 0; i < commons.tooltips[t].names.length; i++) {
            a = a.replaceAll("**" + commons.tooltips[t].names[i], `<span title='${commons.tooltips[t].descriptions[i]}' class='${commons.tooltips[t].class}' >` + commons.tooltips[t].names[i] + "</span>");
        }
    }

    mainloader.innerHTML = a;
}

function getTimeAsNumber(jsn) {
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

async function grabYoutubePosts(page){
    let rq;

    rq =  await fetch(`https://www.googleapis.com/youtube/v3/playlistItems
?part=snippet,contentDetails
&playlistId=${playlistID}
&key=${youtubeKey}${page != 0 ? "&pageToken="+page : ``}`).then(res => res.json());

    youtubePost = youtubePost.concat(rq.items)

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
    posts = posts.filter(post => post.toLowerCase().includes(filter));
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
         ${json.snippet.description === "" ? "no description" : json.snippet.description}<br><br>
         </div></div>`
}

