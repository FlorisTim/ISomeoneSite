const key = "sb_publishable_Ob2o7ujMLXVmwj2UlVFo8Q_Lskuw8et";
const url = "https://zrerchdmjguamvgpdcub.supabase.co";

const supa = window.supabase.createClient(url,key)

let checkProfan = true;
let comments = [];
let times = [];

let index = 0;

const commentTemplate = `            
            <div class="comment">
                <div class="time">
                    TIMEDATE
                </div>
                <div class="text">
                    COMMENTTEXT
                </div>
            </div>`;
let commentSection;


addEventListener("DOMContentLoaded", (event) => Main());

async function Main(){
    const {data, error} = await supa.from("chat").select("*").order("time", {ascending: false}).limit(100);



    console.log(error);
    console.log(data);
    data.forEach((item) => {
        let text = item.text.trim();
        if (profanCheck(text) || !checkProfan) {
            comments.push(text.substring(0,50));
            times.push(new Date(item.time).toLocaleString());
        }

    })

    console.log(comments);
    console.log(times);


    moreComments()
    const node = document.getElementById("textbox");
    node.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            send(node.value);
            node.value = "";
        }
    });
}



function moreComments(){
    if (document.getElementById("morebutton") != null) {
        document.getElementById("morebutton").remove();
    }
    if (document.getElementsByClassName("disappear")[0] != null) {

        document.getElementsByClassName("disappear")[0].remove();
    }

    commentSection = document.getElementById("comments");
    for (let i = 0; i < 3 && index < times.length; i++){
        commentSection.innerHTML += commentTemplate
            .replace("TIMEDATE",times[index])
            .replace("COMMENTTEXT",comments[index]);
        index++;
    }

    if (index < times.length){
        commentSection.innerHTML += `<button id="morebutton" class="button" onclick="moreComments()">more</button>`;
    } else {
        commentSection.innerHTML += `<br class="disappear">`;
        commentSection.innerHTML += "<div class='graytext'>...</div>"
    }


}

function profanCheck(text){
    text = text.trim();
    text = text.replace(" ", "");
    text = text.toLowerCase();

    if (
        text.includes("gg") ||
        text.includes("ck")
    ) {
        return false;
    }
    return true;
}

async function sendContents(){
    send(document.getElementById("textbox").value);
}

async function send(string){
    if ( node.value.length > 4) {
        await supa.from("chat").insert([{text: string}]);
        window.location.reload();
    }
}