import { backend_url } from "./config.js";
import { format, startOfMonth, getDate } from 'https://cdn.skypack.dev/date-fns';



/*-- Important Element --*/

const delete_form = document.getElementById("delete-form");
const notification_box = document.getElementById("notification");
const blur = document.getElementById("bg-blur");
const upcoming_event = document.getElementById("upcoming-event");

/*-- Essiential --*/

const toggle_box = (element_name) => {
    const element = document.getElementById(element_name);
    const isHidden = window.getComputedStyle(element).display === "none";
    element.style.display = isHidden ? "block" : "none";
    blur.style.display = isHidden ? "block" : "none";
}

window.toggle_box = toggle_box;

const has_some_empty = (data) => {
    const has_some_empty = Object.values(data).some(
        val => val === "" || val === undefined || val === null
    );
    return has_some_empty;
}

const anim_increase = (element) => {
    element.classList.remove("animate_increase");
    element.style.animation = "none";
    void element.offsetWidth;
    element.style.animation = "";
    element.classList.add("animate_increase");
};

notification_box.addEventListener("animationend", () => {
    notification_box.classList.remove("animate_increase");
});

const notify_message = (message) => {
    notification_box.innerHTML = message;
    anim_increase(notification_box);
};

const container_id = ["up", "past", "delete"];
const element_container_id = (container_type, id) => {
    return container_id[container_type%3]+"_"+String(id);
}

const new_event = (data, container_type) => {
    if(has_some_empty(data)) return null;

    const event = document.createElement('div');
    event.classList.add('event');

    const event_name = document.createElement('div');
    event_name.classList.add('event-child');
    event_name.classList.add('event-name');
    event_name.innerText = data.event_name;

    const event_time = document.createElement('div');
    event_time.classList.add('event-child');
    event_time.classList.add('time-text');
    let start_time = new Date(data.start_time);
    let end_time = new Date(data.end_time);
    event_time.innerText = format(start_time, "yyyy/MM/dd (HH:mm)") + " - " + format(end_time, "yyyy/MM/dd (HH:mm)");

    const event_tag = document.createElement('div');
    event_tag.classList.add('event-child');
    event_tag.classList.add('event-tag');
    event_tag.innerText = data.tag_name;

    const event_status = document.createElement('div');
    event_status.classList.add('status-circle');
    event_status.classList.add('bg-green');

    const event_status_border = document.createElement('div');
    event_status_border.classList.add('status-inner');
    
    event.appendChild(event_name);
    event.appendChild(event_time);
    event.appendChild(event_tag);
    event_status.appendChild(event_status_border);
    event.appendChild(event_status);
    event.id = element_container_id(container_type, data.id);
    event.dataset.id = data.id;
    return event;
}

const delete_event_containers = (element) => {
    delete_event(element.dataset.id);
    delete_form.removeChild(element);
    const upcoming_child = document.getElementById(element_container_id(0, element.dataset.id));
    if(upcoming_child) upcoming_child.remove();
};

const add_event_containers = (data) => {
    const event = new_event(data, 2);
    // Deletion Form
    if(event != null){
        event.addEventListener("click", (e) => {
            delete_event_containers(e.currentTarget);
        });
        event.classList.add("bg-red-change");
        delete_form.appendChild(event);
    }
    // Upcoming Events
    const event_2 = new_event(data, 0);
    event_2.classList.add("bg-grey-change");
    upcoming_event.appendChild(event_2);
};

/*-- Fetch Events --*/

let event_data = [];

const get_events = async () => {
    try {
        const response = await axios.get(backend_url)
        event_data.push(...response.data);
    }
    catch(error){
        console.log(error);
    }
};

const set_up_events = async () => {
    await get_events();
    for(const e of event_data) add_event_containers(e);
}

set_up_events();

/*-- Calendar HTML --*/

const cell_class = ['border-bottom-white', 'border-right-white'];
const calendar = document.getElementById("calendar");
const today = new Date();
const first_day_of_month = startOfMonth(today);
const today_str = format(today, "EEEE, dd MMMM yyyy")
const today_num_day = getDate(today);
const weekday_num = first_day_of_month.getDay();
let offset = 0;

const calendar_date = document.getElementById("calendar-date");
if(first_day_of_month) calendar_date.innerHTML = today_str;

for(let i=0;i<35;i++){
    const new_div = document.createElement('div');
    new_div.classList.add('item-center');
    new_div.classList.add('bg-grey-change');
    if(i>=weekday_num-1) {
        if(i==today_num_day-1+offset) new_div.style.backgroundColor = "red";
        new_div.innerHTML = i+1-offset;
    }
    else offset++;
    if(i/7<4) new_div.classList.add(cell_class[0]);
    if(i%7<6) new_div.classList.add(cell_class[1]);
    calendar.appendChild(new_div);
}

/*-- Form Data Management --*/

const validate_data = (data) => {
    if(has_some_empty(data)){
        notify_message('Please fill out the empty fields.');
        return false;
    }
    return true;
};

const add_form = document.getElementById("event-form");
add_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form_data = new FormData(add_form);
    let event_data = Object.fromEntries(form_data.entries());
    if(event_data.end_date && event_data.end_time) event_data.end_time = `${event_data.end_date} ${event_data.end_time}:00`;
    if(event_data.start_date && event_data.start_time) event_data.start_time = `${event_data.start_date} ${event_data.start_time}:00`;
    delete event_data.start_date;
    delete event_data.end_date;
    if(validate_data(event_data) == false) return; // TODO 1: Validate event data.
    try {
        const response = await axios.post(backend_url, event_data);
        if(response.data.message) notify_message(response.data.message);
        event_data["id"] = response.data.result[0].insertId;
        add_event_containers(event_data);
        toggle_box('add-form');
        add_form.reset();
    }
    catch(error){
        console.error("Axios error:", error);
        if(error.message) notify_message(error.message)
        if(error.response){
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } 
        else if(error.request){
            console.log("No response received");
        } 
        else {
            console.log("Error setting up request:", error.message);
        }
    }
});

/*-- Event Deletion --*/

const delete_event = async (id) => {
    try {
        const response = await axios.delete(backend_url+"/"+id);
        if(response.data.message) notify_message(response.data.message);
    }
    catch(error){
        if(error.message) notify_message(error.message);
    }
};