import { backend_url } from "./config.js";

const blur = document.getElementById("bg-blur");

function toggle_box(parent_name){
    const element = document.getElementById(parent_name);
    const isHidden = window.getComputedStyle(element).display === "none";
    element.style.display = isHidden ? "block" : "none";
    blur.style.display = isHidden ? "block" : "none";
}

window.toggle_box = toggle_box;

const cell_class = ['border-bottom-white', 'border-right-white'];
const calendar = document.getElementById("calendar");

for(let i=0;i<35;i++){
    const new_div = document.createElement('div');
    new_div.classList.add('item-center');
    new_div.innerHTML = i+1;
    if(i/7<4) new_div.classList.add(cell_class[0])
    if(i%7<6) new_div.classList.add(cell_class[1]);
    calendar.appendChild(new_div);
}

// Form stuff
const form = document.getElementById("event-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form_data = new FormData(form);
    const event_data = Object.fromEntries(form_data.entries());
    if(event_data.end_date && event_data.end_time) event_data.end_time = `${event_data.end_date} ${event_data.end_time}:00`;
    if(event_data.start_date && event_data.start_time) event_data.start_time = `${event_data.start_date} ${event_data.start_time}:00`;
    delete event_data.start_date;
    delete event_data.end_date;
    console.log(event_data)
    try {
        const response = await axios.post(backend_url, event_data);
        console.log(response.data);
        form.reset();
    }
    catch(error){
        console.error("Axios error:", error);
        if(error.response){
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } 
        else if (error.request){
            console.log("No response received");
        } 
        else {
            console.log("Error setting up request:", error.message);
        }
    }
    toggle_box('add-form');
});