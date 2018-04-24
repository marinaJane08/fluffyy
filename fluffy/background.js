//pop审查元素可见
// localforage.setItem('bg',1);
//接收cs的msg，并返回
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   localforage.getItem(request.key).then((val) => {
//     //新增记录
//     if (!val) {
//       localforage.setItem(request.key, []);
//     } else if (request.val) {
//       //将val push 进去
//       val.push(request.val)
//       localforage.setItem(request.key, val);
//     }
//     //只是打开已有的页面啦
//   })
//   sendResponse(200);
// });

// setTimeout(() => {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, "bg发送给cs");
//   });
// }, 5000);
// chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
//   sendResponse({hasPage:true});
//   localforage.getItem(msg.href).then(val => {
//     if (val) {
//       sendResponse({hasPage:true});
//     } else {
//       sendResponse({hasPage:false});
//     }
//   })
// });

chrome.omnibox.onInputChanged.addListener(
  function (text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      { content: text + " one", description: "the first one" },
      { content: text + " number two", description: "the second entry" }
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function (text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
  });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.type === 'hasPage') {
      localforage.getItem(msg.href).then(val => {
        if (val) {
          port.postMessage({ type:'hasPage',hasPage: true });
        } else {
          port.postMessage({ type:'hasPage',hasPage: false });
        }
      })
    } else {
      if (!msg.obj) {
        localforage.removeItem(msg.key);
      } else {
        localforage.setItem(msg.key, msg.obj);
      }
    }
  });
});