const video = document.getElementById("viewVideoElement");
const original = document.getElementById("originalVideoElement");
const yolo = document.getElementById("yoloVideoElement");


function videoChangeClick(val){
    if (val == "original") original.style.display = "block"; //overflow = "visibility";
    else original.style.display = "none";

    if (val == "yolo") yolo.style.display = "block";
    else yolo.style.display = "none";

    if (val == "video") video.style.display = "block";
    else video.style.display = "none";

    if (val == "all") {
        video.style.display = "block";
        yolo.style.display = "block";
        original.style.display = "block";
    }
}