addEventListener("DOMContentLoaded", (event) => Main());

function Main(){
    let action = document.getElementsByClassName("replacers");

    //was born in august of 2009, i set the month to 7 because getMonth returns a value one less than the actual month.
    let birthYear = 2009;
    let birthMonth = 7;
    let now = new Date();
    let ageCalc = now.getFullYear() - birthYear;
    if (now.getMonth() < birthMonth) {
        ageCalc -= 1;
    }

    for (let i = 0; i < action.length; i++) {
        action[i].innerText = action[i].innerText.replace("+age", ageCalc);
        action[i].innerText = action[i].innerText.replace("+year", now.getFullYear);
    }
}