// const element = (
//     <h1>
//         Hello!
//     </h1>
// );

// ReactDOM.render(
//     element,
//     document.getElementById('app')
// );

// let app = document.getElementById('app');

//遍历数据库，创建元素
localforage.iterate((value, key, ) => {
    if (key.indexOf('xizi') === -1) {
        let div = document.createElement('div');
        div.setAttribute('class', 'item');
        let link = document.createElement('h4');
        link.classList.add('link');
        link.innerHTML = value.title;
        link.articleUrl = key;
        link.onclick = function (evt) {
            navigateToPage(evt.target.articleUrl);
        }
        div.appendChild(link);
        div.innerHTML += `<p>倒计时：${value.time}</p>
        <p>正确率：${value.correct}</p>`
        app.appendChild(div);
    }
}).then((result) => {
});

//清除与还原placeholder
document.getElementById('search').onfocus = function (evt) {
    evt.target.placeholder = "";
}
document.getElementById('search').onblur = function (evt) {
    evt.target.placeholder = "输入关键词哦·(๑´ㅂ`๑)";
}

function formatDate(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    let second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + ' 年 ' + m + ' 月 ' + d + ' 日 ' + h + ':' + minute + ':' + second;
};
function setTime() {
    document.getElementById('time').innerHTML = formatDate(new Date())
}
//当前时间
{
    setTime();
    setInterval(() => {
        setTime();
    }, 1000)
}
//发送消息到内容页面
function sendCs(id, msg) {
    chrome.tabs.sendMessage(id, msg);
}
function navigateToPage(url, foo) {
    chrome.tabs.query({}, function (tabs) {
        let tab = null;
        tabs.forEach((item, index) => {
            if (item.url === url) {
                tab = item;
            }
        });
        if (tab) {
            chrome.tabs.update(tab.id, { active: true });
            sendCs(tab.id, "tab发送给cs");
        } else {
            chrome.tabs.create({ url: url }, (new_tab) => {
                setTimeout(() => {
                    sendCs(new_tab.id, "tab发送给cs");
                }, 1000);
            });
        }
    });
}
