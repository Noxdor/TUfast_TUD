//this need to be done here since manifest v2
window.onload = async function(){

    //TODO
    //fix set width and high, so it does not get destoyed by search function

    //get things from storage
    chrome.storage.local.get(['dashboardDisplay', "saved_click_counter"], async function(result) {
        //display courses
        let dashboardDisplay = result.dashboardDisplay
        let courseList = await loadCourses(dashboardDisplay)
        let htmlList = document.getElementsByClassName("list")[0]
        displayCourseList(courseList, htmlList, dashboardDisplay)

        //display saved clicks
        if (result.saved_click_counter === undefined) {result.saved_click_counter = 0}
        let time = clicksToTime(result.saved_click_counter)
        document.getElementById("saved_clicks").innerHTML = "<text><font color='green'>" + result.saved_click_counter + " Klicks</font> gespart: <a href='javascript:void(0)' id='time' target='_blank' style='color: purple;'>"  + time + "</a></text>"
        this.document.getElementById('time').onclick = openSettingsTimeSection
 
    })

    //assign switch function
    document.getElementById('switch').addEventListener('change', () => {
        saveEnabled()
    })

    //asign input search fct
    this.document.getElementById("searchListInput").onkeyup=listSearchFunction

    this.document.getElementById("settings").onclick = openSettings


    displayEnabled()
}

function clicksToTime(clicks) {
    clicks = clicks*3
    let secs = clicks % 60
    let mins = Math.floor(clicks / 60)
    return mins+"min " + secs + "s"
}

function openSettings(){
    chrome.runtime.openOptionsPage()
}

function openSettingsTimeSection(){
    chrome.runtime.sendMessage({cmd: 'open_settings_page', params: 'time_settings'}, function(result) {})
}

function listSearchFunction(){
    let input, filter, list, listEntries,i
    
    input = document.getElementById("searchListInput")
    filter = input.value.toLowerCase()
    list = document.getElementById("list")
    listEntries = list.getElementsByClassName("list-entry")
    
    for(i = 0; i  < listEntries.length; i++){
       let txtValue = listEntries[i].innerHTML.toLowerCase()
       if(!txtValue.includes(filter)) {
           listEntries[i].style.display = "none"
       } else {
        listEntries[i].style.display = ""
       }
    }

    //always show "Klicke hier, um die Kursliste manuell zu aktualisieren..."
    if(listEntries[listEntries.length - 1].innerHTML.includes("Klicke hier, um die Kursliste manuell zu aktualisieren")){listEntries[listEntries.length - 1].style.display = ""}
}

function displayCourseList(courseList, htmlList, type) {
    let link = ""
    let name = ""
    let imgSrc =""
    switch(type) {
        case "favoriten":
            link = "https://bildungsportal.sachsen.de/opal/auth/resource/favorites"
            name = "Klicke hier, um deine Opal-Kurse zu laden."
            imgSrc = "./icons/star.png"
            break
        case "meine_kurse":
            link = "https://bildungsportal.sachsen.de/opal/auth/resource/courses"
            name = "Klicke hier, um deine Opal-Kurse zu laden!"
            imgSrc = "./icons/CoursesOpalIcon.png"
            break
        default:
            break
    }

    if(courseList.length === 0 || courseList === undefined || courseList === false) {
        courseList = []
        courseList.push({"name": name, "link": link})
    } else {
        courseList.push({"name": "&emsp;&emsp;&emsp;&emsp;Klicke hier, um die Kursliste manuell zu aktualisieren ...", "link": link, "img": false})
    }
    
    courseList.forEach(element => {
        let listEntry = document.createElement("a")
        let listImg = document.createElement("div")
        let listText = document.createElement("div")
        let img = document.createElement("img")
        listEntry.className = "list-entry"
        listImg.className = "list-entry-img"
        listEntry.href = element.link
        listEntry.target = "_blank"
        listEntry.onclick = save__two_clicks
        listText.className = "list-entry-text"
        listText.innerHTML = element.name
        img.className = "list-img"
        img.src = imgSrc
        
        
        listImg.appendChild(img)
        if(!(element.img === false)) {listEntry.appendChild(listImg)}
        listEntry.appendChild(listText)

        htmlList.appendChild(listEntry)
    })
}

function save__two_clicks() {
    chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 2})
}

//changeIsEnabledState
function saveEnabled() {
    //only save, if user data is available. Else forward to settings page
    chrome.storage.local.get(['isEnabled'], function(resp) {
        chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
            if(!(result.asdf === undefined || result.fdsa === undefined)) {
                chrome.storage.local.set({isEnabled: !(resp.isEnabled)}, function() {})
            } else {
                chrome.runtime.sendMessage({cmd: 'open_settings_page', params: 'auto_login_settings'}, function(result) {})
            }
        })
    })
    
}

//set switch
function displayEnabled() {
    chrome.storage.local.get(['isEnabled'], function(result) {
        this.document.getElementById('switch').checked = result.isEnabled
    })
}

//return course_list = [{link:link, name: name}, ...]
function loadCourses(type) {
    return new Promise((resolve, reject) => {
        switch(type) {
            case "favoriten":
                chrome.storage.local.get(['favoriten'], function(result) {
                    try {
                        resolve(JSON.parse(result.favoriten))
                    } catch {
                        resolve(false)
                    }
                })
                break
            case "meine_kurse":
                chrome.storage.local.get(['meine_kurse'], function(result) {
                    try {
                        resolve(JSON.parse(result.meine_kurse))
                    } catch {
                        resolve(false)
                    }
                })
                break
            default:
                resolve(false)
                break
        }
    })
}