let posts = [];

main();

const webPosts = document.getElementById("webPost");
const ytPosts = document.getElementById("youtubePost")



async function main(){
  await lazyGrabPosts();  
  filterPosts();
  posts.reverse();
  for (let i = 0; i < posts.length; i++){
    webPosts.innerHTML += generateWebPost(posts[i])
  }
  const fetchedPosts = await getYoutubePosts();
  Console.log(fetchedPosts);
  
}


async function getYoutubePosts() {
  const targetUrl = encodeURIComponent('https://www.youtube.com/playlist?list=PLMcqH_XlXLMw');
  
  return await fetch(`https://corsproxy.io{targetUrl}`)
    .then(res => {
      if (!res.ok) throw new Error('Network response failure');
      return res.text();
    })
    .then(html => {
      const jsonText = html.split('var ytInitialData = ')[1].split(';</script')[0];
      return JSON.parse(jsonText); 
    })
    .catch(err => console.error("Scraping error:", err));
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
    return `         <div class="post"><div class="title">${json.title}</div>
         ${doc.substring(doc.indexOf("~")+1)}
         </div></div>`
}

