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

const format_time = (start_str, end_str) => {
    return format(start_str, "yyyy/MM/dd (HH:mm)") + " - " + format(end_str, "yyyy/MM/dd (HH:mm)");
}

/*-- Event Related --*/

const status_initial_color = [151, 255, 39];
const status_final_color = [255, 39, 39];
const change_order = [0, 1, 2];
const diffs = [Math.abs(status_initial_color[0]-status_final_color[0]), Math.abs(status_initial_color[1]-status_final_color[1]), Math.abs(status_initial_color[2]-status_final_color[2])];

const status_color = (start_time, end_time) => {
    let start_time_js = new Date(start_time.replace(" ", "T"));
    let end_time_js = new Date(end_time.replace(" ", "T"));
    console.log(start_time_js, end_time_js);
    if(end_time_js.getTime()<=today.getTime()) return `rgb(${status_final_color[0]}, ${status_final_color[1]}, ${status_final_color[2]})`;
    let percentage = Math.min(100, Math.max((today.getTime()-start_time_js.getTime())/(end_time_js.getTime()-start_time_js.getTime())*100.0, 0));
    let color_reduction = Math.floor(percentage/100.0*(diffs[0]+diffs[1]+diffs[2]));
    let color = status_initial_color;
    let idx = 0;
    while(color_reduction>0 && idx<change_order.length){
        let diff = status_final_color[change_order[idx]]-status_initial_color[change_order[idx]];
        if(diff == 0){
            idx++
            continue;
        }
        let sign = Math.abs(diff)/diff;
        if(color_reduction>=Math.abs(diff)){
            color[change_order[idx]]+=diff;
            color_reduction-=Math.abs(diff);
        }
        else {
            color[change_order[idx]]+=sign*color_reduction;
            color_reduction = 0;
        }
        idx++;
    }
    console.log(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
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
    event_time.innerText = format_time(start_time, end_time);

    const event_tag = document.createElement('div');
    event_tag.classList.add('event-child');
    event_tag.classList.add('event-tag');
    event_tag.innerText = data.tag_name;

    const event_status = document.createElement('div');
    event_status.classList.add('status-circle');
    event_status.style.backgroundColor = status_color(data.start_time, data.end_time);

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
    console.log(data);
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
    event_2.addEventListener("click", (e) => {
        const current_target = e.currentTarget;
        const data_target = events_data.find(item => String(item.id) === String(current_target.dataset.id));
        open_info(data_target);
        toggle_box('event-info');
    });
    upcoming_event.appendChild(event_2);
};

const event_info = document.getElementById("event-info");
const info_topic = event_info.querySelector(".form-topic");
const info_time = event_info.querySelector(".info-time");
const info_desc = event_info.querySelector(".info-desc");
const info_tag = event_info.querySelector(".event-tag");
const info_status = event_info.querySelector(".status-circle");
const open_info = (data) => {
    if(has_some_empty(data)){
        notify_message('Info has empty values.');
        return;
    }
    info_topic.innerHTML = data.event_name;
    info_time.innerHTML = "<strong>Time: </strong>" + format_time(data.start_time, data.end_time);
    info_desc.innerHTML = "<strong>Description: </strong><br>" + data.desc_text;
    info_tag.innerHTML = data.tag_name;
    info_status.style.backgroundColor = status_color(data.start_time, data.end_time);
}

/*-- Fetch Events --*/

let events_data = [];

const get_events = async () => {
    try {
        const response = await axios.get(backend_url)
        events_data.push(...response.data);
    }
    catch(error){
        console.log(error);
    }
};

const set_up_events = async () => {
    await get_events();
    for(const e of events_data) add_event_containers(e);
}

set_up_events();

/*-- Calendar HTML --*/

const cell_class = ['border-bottom-white', 'border-right-white'];
const calendar = document.getElementById("calendar");
const today = new Date();
const first_day_of_month = startOfMonth(today);
const today_str = format(today, "EEEE, dd MMMM yyyy");
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
        if(i==today_num_day-1+offset) new_div.style.backgroundColor = "rgba(66, 64, 79, 0.67)";
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
    const event_start_date = new Date(new Date(`${data.start_date}T${data.start_time}:00`));
    const event_end_date = new Date(`${data.end_date}T${data.end_time}:00`);
    if(event_end_date.getTime()<today.getTime()){
        notify_message("Event ended long time ago.");
        return false;
    }
    if(event_start_date.getTime()>event_end_date.getTime()){
        notify_message("Event ended before it even started.");
        return false;
    }
    return true;
};

const add_form = document.getElementById("event-form");
add_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form_data = new FormData(add_form);
    let event_data = Object.fromEntries(form_data.entries());
    if(validate_data(event_data) == false) return;
    if(event_data.end_date && event_data.end_time) event_data.end_time = `${event_data.end_date} ${event_data.end_time}:00`;
    if(event_data.start_date && event_data.start_time) event_data.start_time = `${event_data.start_date} ${event_data.start_time}:00`;
    delete event_data.start_date;
    delete event_data.end_date;
    try {
        const response = await axios.post(backend_url, event_data);
        if(response.data.message) notify_message(response.data.message);
        event_data["id"] = response.data.result[0].insertId;
        add_event_containers(event_data);
        events_data.push(event_data);
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