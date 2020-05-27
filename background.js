'use strict';

////////Code to run when extension is loaded
console.log('Loaded TU Dresden Auto Login')
chrome.storage.local.set({loggedOutSelma: false}, function() {})
chrome.storage.local.set({loggedOutQis: false}, function() {})
chrome.storage.local.set({loggedOutOpal: false}, function() {})
chrome.storage.local.set({loggedOutOwa: false}, function() {})
chrome.storage.local.set({loggedOutMagma: false}, function() {})
chrome.storage.local.set({loggedOutJexam: false}, function() {})
chrome.storage.local.set({loggedOutCloudstore: false}, function() {})
chrome.storage.local.set({openSettingsPageParam: false}, function() {})


chrome.runtime.onInstalled.addListener(async(details) => {
  const reason = details.reason
  switch (reason) {
     case 'install':
        //Show page on install
        console.log('TU Dresden Auto Login installed.')
        openSettingsPage("first_visit")
        chrome.storage.local.set({showed_50_clicks: false}, function() {});
        chrome.storage.local.set({showed_100_clicks: false}, function() {});
        chrome.storage.local.set({submitted_review: false}, function() {})
        chrome.storage.local.set({refused_review: false}, function() {})
        chrome.storage.local.set({showed_feedback_screen_counter: 0}, function() {})
        chrome.storage.local.set({isEnabled: false}, function() {})
        chrome.storage.local.set({fwdEnabled: true}, function() {})
        chrome.storage.local.set({encryption_level: 2}, function() {})
        chrome.storage.local.set({meine_kurse: false}, function() {})
        chrome.storage.local.set({favoriten: false}, function() {})
        //chrome.storage.local.set({openSettingsPageParam: false}, function() {})
        chrome.storage.local.set({dashboardDisplay: "favoriten"}, function() {})
        break;
     case 'update':
        //Show page on update
        //chrome.tabs.create({ url: "update.html" });
        //chrome.storage.local.set({isEnabled: true}, function() {})
        //chrome.storage.local.set({fwdEnabled: true}, function() {})
        //check if encryption is already on level 2
        chrome.storage.local.get(['encryption_level'], (resp) => {
          if(!(resp.encryption_level === 2)){
            console.log('Upgrading encryption standard to level 2...')
            chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
              setUserData({asdf: atob(result.asdf), fdsa: atob(result.fdsa)})
              chrome.storage.local.set({encryption_level: 2}, function() {})
            })
          }
        })
        //check if dashboard display is selected
        chrome.storage.local.get(['dashboardDisplay'], (resp) => {
          if(resp.dashboardDisplay === null || resp.dashboardDisplay === undefined || resp.dashboardDisplay === ""){
            chrome.storage.local.set({dashboardDisplay: "favoriten"}, function() {})
          }
        })
        break;
     default:
        console.log('Other install events within the browser for TU Dresden Auto Login.')
        break;
  }
})

//show badge when extension is triggered
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.cmd) {
    case 'show_ok_badge':
      show_badge('Login', '#4cb749', request.timeout)
      break
    case 'no_login_data':
      //alert("Bitte gib deinen Nutzernamen und Passwort in der TU Dresden Auto Login Extension an! Klicke dafür auf das Erweiterungssymbol oben rechts.")
      //show_badge("Error", '#ff0000', 10000)
      break
    case 'perform_login':
      //show_feedback_window()
      break
    case 'clear_badge':
      show_badge("", "#ffffff", 0)
      break
    case 'save_clicks':
      save_clicks(request.click_count)
      break
    case 'get_user_data':
      getUserData().then((userData) => sendResponse(userData))
      break
    case 'set_user_data':
      setUserData(request.userData)
      break
    case 'logged_out':
      loggedOut(request.portal)
      break
    case 'save_courses':
      saveCourses(request.course_list)
      break
    case 'open_settings_page':
      openSettingsPage(request.params)
      break
    default:
      console.log('Cmd not found!')
      break
  }
  return true //required for async sendResponse

})

//open settings (=options) page, if required set params
function openSettingsPage(params){
  if(params === "auto_login_settings"){
    chrome.storage.local.set({openSettingsPageParam: "auto_login_settings"}, function() {
      //maybe reload page if already opened, because click event is not executed
      //window.open("./register_user.html")
      chrome.runtime.openOptionsPage()
    })
  }
  if(params === "first_visit"){
    chrome.storage.local.set({openSettingsPageParam: "first_visit"}, function() {
      //maybe reload page if already opened, because click event is not executed
      window.open("./register_user.html")
      //chrome.runtime.openOptionsPage()
    })
  }
  
}

//timeout is 2000 default
function loggedOut(portal) {
  let timeout = 2000
  if(portal === "loggedOutCloudstore") {timeout = 7000}
  let loggedOutPortal = {}
  loggedOutPortal[portal] = true
  chrome.storage.local.set(loggedOutPortal, function() {});
  setTimeout(function() {
    loggedOutPortal[portal] = false
    chrome.storage.local.set(loggedOutPortal, function() {});
  }, timeout);
}

function show_badge(Text, Color, timeout) {
  chrome.browserAction.setBadgeText({text: Text});
  chrome.browserAction.setBadgeBackgroundColor({color: Color});
  setTimeout(function() {
    chrome.browserAction.setBadgeText({text: ""});
  }, timeout);
}

function show_feedback_window(){
  //check whether feedback screen should be shown!
  var saved_clicks = 0
  chrome.storage.local.get(['saved_click_counter'], (result) => {
    saved_clicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter 
    //if(saved_clicks > 100) {show_feedback_100_window()}
    //else if (saved_clicks > 50) {show_feedback_50_window()}
  })

}

function save_clicks(counter){
  //load number of saved clicks and add counter!
  var saved_clicks = 0;
  chrome.storage.local.get(['saved_click_counter'], (result) => {
    saved_clicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter 
    chrome.storage.local.set({saved_click_counter: saved_clicks + counter}, function() {
      console.log('You just saved yourself ' + counter + " clicks!")
    });
  })
}

function show_feedback_50_window(){
  chrome.storage.local.get(['showed_50_clicks'], (result) => {
    if(!result.showed_50_clicks) {
      chrome.tabs.create({ url: "reached_50_clicks.html" });
      chrome.storage.local.set({showed_50_clicks: true}, function() {});
      count_feedback_window_shown()
    }
  }) 
}

function show_feedback_100_window(){
  chrome.storage.local.get(['submitted_review', 'showed_100_clicks', 'refused_review'], (result) => {
    //decide whether feedback screen should be shown
    if(!(result.submitted_review || result.refused_review)) {
      chrome.tabs.create({ url: "reached_100_clicks.html" });
      chrome.storage.local.set({showed_100_clicks: true}, function() {});
      count_feedback_window_shown()
    }
  })
}

function count_feedback_window_shown(){
  //count how many times feedback screen has been shown
  chrome.storage.local.get(['showed_feedback_screen_counter'], (result) => {
    if(!result.showed_feedback_screen_counter) {
      chrome.storage.local.set({showed_feedback_screen_counter: 1}, function() {})
      return
    }
    chrome.storage.local.set({showed_feedback_screen_counter: result.showed_feedback_screen_counter+1}, function() {})        
  })
}

function hashDigest(string) {
  return new Promise (async (resolve, reject) => {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(string))
    resolve(hashBuffer)
  })
} 

function getKeyBuffer(){
  return new Promise((resolve, reject) => {
    let sysInfo = ""
    chrome.system.cpu.getInfo(info => {
      //TROUBLE if api changes!
      delete info['processors']
      delete info['temperatures']
      sysInfo = sysInfo + JSON.stringify(info)
      chrome.runtime.getPlatformInfo(async (info) => {
        sysInfo = sysInfo + JSON.stringify(info)
        let keyBuffer = await crypto.subtle.importKey('raw' , await hashDigest(sysInfo), 
                                                      {name: "AES-CBC",}, 
                                                      false, 
                                                      ['encrypt', 'decrypt']) 
        resolve(keyBuffer)       
      })
    })
  })
}

async function setUserData(userData) {
  let userDataConcat = userData.asdf + '@@@@@' + userData.fdsa
  let encoder = new TextEncoder()
  let userDataEncoded =  encoder.encode(userDataConcat)
  let keyBuffer = await getKeyBuffer()
  let iv = crypto.getRandomValues(new Uint8Array(16))
  let userDataEncrypted =  await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv
    },
    keyBuffer,
    userDataEncoded
  )
  userDataEncrypted = Array.from(new Uint8Array(userDataEncrypted))                             
  userDataEncrypted = userDataEncrypted.map(byte => String.fromCharCode(byte)).join('')           
  userDataEncrypted = btoa(userDataEncrypted)
  iv = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
  chrome.storage.local.set({Data: iv + userDataEncrypted}, function() {})
}

//return {asdf: "", fdsa: ""}
async function getUserData(){
  return new Promise(async (resolve, reject) => {
      let keyBuffer = await getKeyBuffer()
      chrome.storage.local.get(['Data'], async (Data) => {
        //check if Data exists, else return
        if(Data.Data === undefined || Data.Data === "undefined" || Data.Data === null) {
          resolve({asdf: undefined, fdsa: undefined})
          return
        }
        let iv = await Data.Data.slice(0,32).match(/.{2}/g).map(byte => parseInt(byte, 16)) 
        iv = new Uint8Array(iv)
        let userDataEncrypted = atob(Data.Data.slice(32))                                       
        userDataEncrypted = new Uint8Array(userDataEncrypted.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))
        let UserData =  await crypto.subtle.decrypt(
          {
            name: "AES-CBC",
            iv: iv
          },
          keyBuffer,
          userDataEncrypted
        )
        UserData = new TextDecoder().decode(UserData)
        UserData = UserData.split("@@@@@")
        resolve({asdf: UserData[0], fdsa: UserData[1]})
      })  
    })
}
//course_list = {type:"", list:[{link:link, name: name}, ...]}
function saveCourses(course_list) {
  course_list.list.sort((a, b) => (a.name > b.name) ? 1 : -1)
  switch (course_list.type) {
    case 'favoriten':
      chrome.storage.local.set({favoriten: JSON.stringify(course_list.list)}, function() {})
      console.log('saved Favoriten in TUDresdenAutoLogin')
      break
    case 'meine_kurse':
      chrome.storage.local.set({meine_kurse: JSON.stringify(course_list.list)}, function() {})
      console.log('saved Meine Kurse in TUDresdenAutoLogin')
      break
    default:
      break
  }
}

//return course_list = [{link:link, name: name}, ...]
function loadCourses(type) {
  switch(type) {
      case "favoriten":
          chrome.storage.local.get(['favoriten'], function(result) {
              console.log(JSON.parse(result.favoriten))
          })
          break
      case "meine_kurse":
          chrome.storage.local.get(['meine_kurse'], function(result) {
              console.log(JSON.parse(result.meine_kurse))
          })
          break
      default:
          break
  }
}