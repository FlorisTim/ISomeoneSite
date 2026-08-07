let posts = [];
let youtubePosts = [];

document.addEventListener('DOMContentLoaded', () => {main()});



const webPosts = document.getElementById("webPost");
const ytPosts = document.getElementById("youtubePost")

const dungePlaylist = `PLMcqH_XlXLMw`;
const youtubeKey = `AIzaSyD-KjEjV-eGaMM6tJA084n_d7ZncI_UT5I`; //this is safe;;;;;; restricted to https://www.isomeone.nl only

async function main() {
    loadInformation("startinfo")

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

const keywordFunctions = ["for","length","charAt","drawTexture", "if", "else","drawInputAt","containsKey","xyhash","drawSelectedButton","drawButton","MOVE ","MOVE_X","do"];
const functionExplanations = ["for loop","returns the length of an array or a string","returns the character at a certain index","draws a sprite or image at a location","runs the following code if the statement returns true","runs the following code if last if statement returned false",
"draws input text field", "returns true if the hashmap contains that key","returns a value based on 2 integers","draws a highlighted button","draws a button","moves on x and y",
"moves only on x axis","injects a file before compiling"]
const keywordTypes = ["int", "double", "float", "long", "void", "boolean","enum","var","autovar","autopvar"];
const typeExplanations = ["integer type, uses 32 bits and two`s compliment","floating point type, uses 64 bits and the IEEE format","float type, uses 32 bits and the IEEE format",
    "integer type, uses 64 bits and two`s compliment","void means that the method after it does not return anything","boolean type, i think it uses 1 byte to store the true or false",
"saves any arguments after as references to their index","saves first argument as reference to the second argument","automatically saves the first argument as reference to how many times autovar has been used","automatically saves the first argument as reference to how many times autopvar has been used"]

const keywordsValues = ["true","false","neg","blank","%0","x","y","-t1", "-t2"];
const valuesExplanations = ["boolean true","boolean false","used for negating a number","empty argument","gets replaced by anything in the first index of arguments",
"x position","y position","sine timer extension", "cosine timer extension"];

const mainloader = document.getElementById("MAINLOADER");
async function loadInformation(name){
    let a = await fetch("./infos/" + name + ".html")
    a = (await a.text())
        .replaceAll("\\[","OPENSQUARE").replaceAll("\\]", "CLOSESQUARE")
        .replaceAll("[\"back\"]","[\"qlink title\" onclick=\"loadInformation('startInfo')\"]Back[/]")
        .replaceAll("[/]", "</div>")
        .replaceAll("[","<div class=").replaceAll("]",">")
        .replaceAll("    ","<span class='tab'></span>")
        .replaceAll("OPENSQUARE","[").replaceAll("CLOSESQUARE","]");

    let inkbd = false;
    let quote = false;

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


    for (let i = 0; i < keywordTypes.length; i++) {
        a = a.replaceAll("**" + keywordTypes[i], `<span title='${typeExplanations[i]}' class='kwdtype' >` + keywordTypes[i] + "</span>");
    }
    for (let i = 0; i < keywordFunctions.length; i++) {
        a = a.replaceAll("**" + keywordFunctions[i], `<span title='${functionExplanations[i]}' class='kwdfunc'>` + keywordFunctions[i] + "</span>");
    }
    for (let i = 0; i < keywordsValues.length; i++) {
        a = a.replaceAll("**" + keywordsValues[i], `<span title='${valuesExplanations[i]}' class='kwdvalue' >` + keywordsValues[i] + "</span>");
    }
    mainloader.innerHTML = a;

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

