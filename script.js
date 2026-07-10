addEventListener("DOMContentLoaded", (event) => Main());

async function Main() {
    const html = fetch("/youtube.xml")

    const json = JSON.parse(html.match(/var ytInitialData = (.*?);<\/script>/s));

    console.log(json);
}