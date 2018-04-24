; (function () {

  //容器key标识
  let container = false;
  //容器key松开的当前元素
  let ctn_el = null;

  document.onkeydown = function (evt) {
    //不能使用重义的key
    if (evt.keyCode === 192) {
      container = true;
    }
  }

  document.onkeyup = function (evt) {

    if (evt.keyCode === 192) {
      //设置选中当前元素
      ctn_el.style.border = "1px solid #eee";
      ctn_el.style.boxShadow = "3px 3px 3px #7277bb91";
      //container+1
      if (evt.keyCode === 192 && evt.keyCode === 49) {
      }
    }
    container = false;
  }

  //选择文章容器
  document.onmouseover = function (evt) {
    //鼠标hover
    if (container) {
      evt.target.style.boxShadow = "3px 3px 3px #ddd";
      //当前选中赋值
      ctn_el = evt.target;
    }
  }

  document.onmouseout = function (evt) {
    //鼠标hover离开
    if (container) {
      evt.target.style.boxShadow = "none";
    }
  }

  document.onmouseup = function (evt) {
    //去除空格
    let sl = window.getSelection();
    let str = sl.toString().replace(/\s/g, "");
    if (str) {
      //sl.getRangeAt(0).commonAncestorContainer.baseURI
      //找到父元素
      let father = findFather(sl);
      let text = father.textContent.replace(/\s/g, "");
      let html = father.outerHTML;
      //选中的开始和结束文字内容
      let start = sl.getRangeAt(0).startContainer.data.replace(/\s/g, "");
      let end = sl.getRangeAt(0).endContainer.data.replace(/\s/g, "");
      let html_start = sl.getRangeAt(0).startContainer.parentElement !== father ? sl.getRangeAt(0).startContainer.parentElement.outerHTML : sl.getRangeAt(0).startContainer.data;
      let html_end = sl.getRangeAt(0).endContainer.parentElement !== father ? sl.getRangeAt(0).endContainer.parentElement.outerHTML : sl.getRangeAt(0).endContainer.data;
      //将这一段用span包起来
      let time = 'xizi' + new Date().getTime();
      // console.log('father====', father)
      // console.log("start====:", start)
      // console.log("end====:", end)
      console.log("html_start====:", html_start)
      console.log("html_end====:", html_end)
      // console.log("str====", str)
      //console.log("beforeText====",text)

      //console.log("html====:", father.outerHTML)
      //console.log('beforeHTML====',father.outerHTML)
      if (text.match(`${start}${end}`)) {
        text = text.match(`${start}${end}`);
      } else if (text.match(`${end}${start}`)) {
        text = text.match(`${end}${start}`);
      } else if (text.match(`${start}.+${end}`)) {
        text = text.match(`${start}.+${end}`);
      } else if (text.match(`${end}.+${start}`)) {
        text = text.match(`${end}.+${start}`);
      } else if (text.match(`${start}`)) {
        text = text.match(`${start}`);
      } else {
        console.log('没找着')
      }
      console.log(text[0])
      if (text[0]) {
        text = text[0].replace(new RegExp(str), `<span style="color:red;" id="${time}">${str}</span>`)
        //console.log(text)
        //console.log('afterText====',text)
        //console.log('afterMath',text)
        //替换innerHTML里的内容,要设置start 和 end 的 outerHTML
        if (html.match(`${html_start}${html_end}`)) {
          father.outerHTML = html.replace(new RegExp(`${html_start}${html_end}`), text);
        } else if (html.match(`${html_end}${html_start}`)) {
          father.outerHTML = html.replace(new RegExp(`${html_end}${html_start}`), text);
        } else if (html.match(`${html_start}.+${html_end}`)) {
          father.outerHTML = html.replace(new RegExp(`${html_start}.+${html_end}`), text);
        } else if (html.match(`${html_end}.+${html_start}`)) {
          father.outerHTML = html.replace(new RegExp(`${html_end}.+${html_start}`), text);
        } else if (html.match(`${html_start}`)) {
          father.outerHTML = html.replace(new RegExp(`${html_start}`), text);
        } else {
          console.log('html匹配不了')
        }
      }
      //创建元素并设置元素定位
      //console.log(document.getElementById(time).offsetTop);
      console.log('---------------')
      //sl.removeAllRanges()
    }
  }

  function findFather(a) {
    let el = a.getRangeAt(0).commonAncestorContainer;
    if (el.nodeName !== '#text') {
      return el
    } else {
      return el.parentElement
    }
  }

  //文章元素选中事件函数
  function articleMouseUp(evt) {
    let sl = window.getSelection();
    let str = sl.toString();
    if (str) {
      let at = sl.getRangeAt(0);//range对象
      let rect = at.getClientRects();//选中区域的rect集合
      let el;
      let time = 'xizi' + new Date().getTime();
      if (a) {
        el = document.createElement('input');
        el.answer = str;
        el.style = `position:absolute;left:${rect.x}px;top:${rect.y}px;width:${rect.width + 10}px;`;
        el.classList.add('xiziInput');
        div.appendChild(el);
        //删除元素
        el.ondblclick = function (evt) {
          div.removeChild(evt.target)
          localforage.removeItem(el.time)
        }
      } else {
        el = cloneNode(at.commonAncestorContainer.parentElement);
        // console.log(sl.getRangeAt(0).cloneContents())
        el.innerText = str;
        el.style.position = 'absolute'
        el.style.left = rect.x + 'px';
        el.style.top = rect.y + 'px';
        //删除元素
        el.onclick = function (evt) {
          div.removeChild(evt.target)
          localforage.removeItem(el.time)
        }
      }
      el.time = time;
      localforage.setItem(time, {
        val: str,
        url: at.commonAncestorContainer.baseURI,
        x: rect.x,
        endx: rect.x + rect.width,
        y: rect.y,
        isA: a,
        check: 0
      })
      sl.removeAllRanges();
    }
  }
  //文章元素选中事件函数-rect & content
  function articleMouseUp(evt) {
    let sl = window.getSelection();
    let str = sl.toString();
    if (str) {
      let at = sl.getRangeAt(0);//range对象
      let rect = at.getClientRects();//选中区域的rect集合
      let el;
      let time = 'xizi' + new Date().getTime();
      if (a) {
        el = document.createElement('input');
        el.answer = str;
        el.style = `position:absolute;left:${rect.x}px;top:${rect.y}px;width:${rect.width + 10}px;`;
        el.classList.add('xiziInput');
        div.appendChild(el);
      } else {
        let rect = sl.getRangeAt(0).getClientRects();
        let content = sl.getRangeAt(0).cloneContents();
        console.dir(rect)
        console.dir(content)
        content.childNodes.forEach((i, index) => {
          if (i.nodeName !== "#text") {
            el = div.appendChild(i);
          } else {
            el = div.appendChild(document.createElement('span'));
            el.innerText = i.data;
          }
          el.classList.add('xiziItem');
          el.style.left = rect[index].left + 'px';
          el.style.top = rect[index].top + 'px';
        })
      }
      //删除元素
      el.onclick = function (evt) {
        div.removeChild(evt.target)
        localforage.removeItem(el.time)
      }
      el.time = time;
      localforage.setItem(time, {
        val: str,
        url: at.commonAncestorContainer.baseURI,
        x: rect.x,
        endx: rect.x + rect.width,
        y: rect.y,
        isA: a,
        check: 0
      })
      sl.removeAllRanges();
    }
  }
})(this)