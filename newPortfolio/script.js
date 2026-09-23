const date = new Date();
//assume the replacers and class names are the same
const replacers = {
    age: new Date(2009,7,14),
    programmingExperience: new Date(2018,0,1),
    codingExperience: new Date(2024,0,1),
    musicExperience: new Date(2021,0,1)
}

document.addEventListener('DOMContentLoaded', () => {
    const commonSuffix = "%Y</span><span class='grey'> years";
    replaceDate("age", "%Y-year-old");
    replaceDate("programmingExperience", commonSuffix);
    replaceDate("codingExperience", commonSuffix);
    replaceDate("musicExperience", commonSuffix);
});

function replaceDate(replacer, text){
    const repls = document.getElementsByClassName(replacer);

    for (const repl of repls){
        const selectedDate =  replacers[replacer]

        const result = new Date(date.getTime() - selectedDate.getTime());

        repl.innerHTML = text
            .replaceAll("%Y",result.getFullYear()-1970)
            .replaceAll("%M",result.getMonth());
    }
}