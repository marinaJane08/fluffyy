; (function () {
  //step:用户按住键鼠标选择文章容器，存入容器的路径
  //step:克隆或创建一个wrap，用户按住键将其与文章容器平分屏幕或还原
  //step:用户按住键，鼠标选择，将问题或答案复制到wrap中，并存入DB
  //step:遍历DB渲染到wrap，用户按住键wrap全屏
  //step:撤销操作
  //step:可删除
  //step:单页面，判断href
  //step:
  ///////////////////////////////////////////////////////////全局变量声明
  //容器key标识
  let picking = false;
  //容器key松开的当前元素
  let picking_article = null;
  //答案标识
  let a = false;
  //开始答题的计数器
  let current_count = 0;
  let count = null;
  //以文章容器的直属元素作为target取其Top值与indexof值
  let current_target;

  let wrap = null, div = null, article = null;
  ///////////////////////////////////////////////////////////鼠标键盘事件监听
  document.onkeydown = function (evt) {
    // console.log(evt.keyCode)
    if (evt.keyCode === 192) {
      picking = true;
    } else if (evt.keyCode === 17) {
      a = true;
    }
  }

  document.onkeyup = function (evt) {
    //监听创建/显示隐藏wrap
    if (evt.keyCode === 192) {
      //设置选中当前元素
      //不是null与html以及body
      if (picking_article !== null && picking_article !== document.body && picking_article !== document.documentElement) {
        if (wrap !== null) {
          removeWrap()
          createWrap(picking_article)
        } else {
          createWrap(picking_article)
        }
        localforage.setItem(location.href, {
          title: document.title,
          path: findFather(picking_article),
          time: 0,
          correct: 0
        });
        sendToBg({
          key: location.href, obj: {
            title: document.title,
            path: findFather(picking_article),
            time: 0,
            correct: 0
          }
        });
      }
      if (evt.keyCode === 192 && evt.keyCode === 49) {
      }
    } else if (evt.keyCode === 17) {
      a = false;
      //div全屏或非全屏
      // if (div.style.width === '100%') {
      //   div.style.width = '50%'
      //   hideShowEl(article, true)
      // } else {
      //   div.style.width = '100%';
      //   hideShowEl(article, false)
      // }
      // //重新调整div中元素的位置
      // document.getElementsByClassName('xiziInput')[0].focus();

      //终止触发事件
      //evt.returnValue=false;
    } else if (evt.keyCode === 18) {
      hideShowEl(wrap)
    }
    picking = false;
  }

  //选择文章容器
  document.onmouseover = function (evt) {
    //鼠标hover
    if (picking) {
      evt.target.style.boxShadow = "3px 3px 3px #7277bb91";
      //当前选中赋值
      picking_article = evt.target;
    }
  }

  document.onmouseout = function (evt) {
    //鼠标hover离开
    if (picking) {
      evt.target.style.boxShadow = "none";
    }
  }
  ////////////////////////////////////////////////////////////扩展消息传递
  //与bg、tab通信
  // chrome.runtime.sendMessage({ test: "hello" }, function (response) {
  //   console.log({ "cs发送给bg的内容bg已经接收到了": response });
  // });
  // chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
  //   console.log({ "cs接收到的内容": msg });
  //   // sendResponse({ msg: 'cs已经接收到了' })
  // });

  //建立长连接
  var port = chrome.runtime.connect({ name: "xizi" });
  port.onMessage.addListener(function (msg, sender) {
    console.log({"从bg接收数据":msg})
    if (msg.type === 'hasPage') {
      if (msg.hasPage) {
        localforage.getItem(location.href).then(val => {
          if (val) {
            element(document.body, 'button', 'Fluffy', function () {
              article = eval(val.path);
              createWrap(article);
            }).style = "position:absolute;right:0;top:0;";
          }
        });
      }
    }
  });
  //发送数据到bg
  function sendToBg(obj) {
    port.postMessage(obj);
  }
  {
    sendToBg({ href: location.href, type: 'hasPage' });
  }
  ///////////////////////////////////////////////////////////函数声明
  //设置选中当前元素
  function createWrap(el) {
    wrap = document.createElement('div');
    wrap.setAttribute('id', 'xiziWrap');
    document.body.appendChild(wrap);
    wrap.style.width = document.body.clientWidth + 'px';
    wrap.style.height = document.body.scrollHeight + 'px';
    article = el.cloneNode(true);
    article.classList.add('xiziArticle');
    wrap.appendChild(article);
    //文章元素选中事件
    article.onmousedown = articleMouseDown;
    article.onmouseup = articleMouseUp;
    article.spellcheck = false;
    //创建mask元素
    div = document.createElement('div');
    div.setAttribute('id', 'xiziMask');
    wrap.appendChild(div);
    div.style.height = article.offsetHeight + 'px';
    //浏览器调整大小时
    window.onresize = function () {
      wrap.style.width = document.body.clientWidth + 'px';
      div.style.height = article.offsetHeight + 'px';
      //重新调整div中元素的位置
    }
    count = element(wrap, 'h2', current_count)
    count.style = "position:fixed;right:0;top:0;";
    //将数据库内容渲染
    let item_arr = [];
    localforage.iterate((value, key) => {
      if (key.indexOf('xizi') !== -1) {
        if (value.url === location.href) {
          item_arr.push({ key: key, val: value })
          div.innerHTML += value.html;
        }
      }
    }).then((result) => {
      console.log('数据渲染完成')
      item_arr.forEach((value, index) => {
        //等到document渲染完成再遍历元素
        let el = document.getElementById(value.key);
        if (value.val.isA) {
          el.answer = value.val.val;
          el.onchange = handleInput;
        }
        el.onclick = removeEl;
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  //删除容器元素
  function removeWrap() {
    document.body.removeChild(wrap)
  }
  //隐藏显示元素
  function hideShowEl(el, flag) {
    if (flag) {
      el.style.display = flag ? 'block' : 'none';
    } else {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  }

  //删除mask元素及数据库记录
  function removeEl(evt) {
    div.removeChild(evt.target);
    localforage.removeItem(evt.target.id);
    sendToBg({ key: evt.target.id });
  }
  /*
    //文章元素选中事件函数
    // function articleMouseUp(evt) {
    //   let sl = window.getSelection();
    //   let str = sl.toString().replace(/\s/g, "");
    //   if (str) {
    //     let at = sl.getRangeAt(0);//range对象
    //     console.dir(at)
    //     let el, time;
    //     let content = sl.getRangeAt(0).cloneContents();
    //     let index = -1;
    //     let rect = at.getClientRects();//选中区域的rect集合
    //     //是否为code==>不是则不循环rect
    //     //是否为answer==>创建input/textarea或span/code并绑定单击/双击事件以及不同类名和宽度
    //     if (at.commonAncestorContainer.nodeName === 'CODE') {
    //       let code;
    //       if (a) {
    //         code = document.createElement('textarea');
    //         code.classList.add('xiziTextarea');
    //         code.answer = str;
    //         code.style.width = at.commonAncestorContainer.offsetWidth + 'px';
    //         //textarea高度自适应
    //         code.onkeyup = function (evt) {
    //           evt.target.style.height = evt.target.scrollHeight + 'px';
    //         }
    //         code.onchange = handleInput;
    //       } else {
    //         code = at.commonAncestorContainer.cloneNode(false);
    //         code.classList.add('xiziItem');
    //         code.classList.add('xiziCode');
    //         code.appendChild(content);
    //       }
    //       code.onclick = removeEl;
    //       div.appendChild(code);
    //       code.style.left = rect[0].left > 0 ? rect[0].left : 0 + 'px';
    //       code.style.top = rect[0].top + document.documentElement.scrollTop + 'px';
    //       //元素的戳
    //       time = 'xizi' + new Date().getTime();
    //       code.id = time;
    //       localforage.setItem(time, {
    //         val: str,
    //         url: at.commonAncestorContainer.baseURI,
    //         x: rect[0].left > 0 ? rect[0].left : 0 + 'px',
    //         y: rect[0].top + document.documentElement.scrollTop + 'px',
    //         width: at.commonAncestorContainer.offsetWidth + 'px',
    //         isA: a,
    //         check: 0,
    //         isCode: true,
    //         html: code.outerHTML
    //       })
    //     } else {
    //       let init = 0;
    //       for (let i of content.childNodes) {
    //         //判断是否内容为非空字符
    //         if (!(/^[\s\u21b5]*$/.test(i.textContent))) {
    //           //判断是否为答案
    //           if (a) {
    //             el = document.createElement('input');
    //             el.answer = str;
    //             el.classList.add('xiziInput');
    //             div.appendChild(el);
    //             index++;
    //             el.style.width = rect[index].width + 10 + 'px';
    //             el.onchange = handleInput;
    //           } else {
    //             if (i.nodeName !== "#text") {
    //               el = div.appendChild(document.createElement(i.nodeName));
    //               index++;
    //             } else {
    //               el = div.appendChild(document.createElement('span'));
    //               index++;
    //             }
    //             if (init === 0) {
    //               el.innerHTML = `<span style="opacity:0;">${at.startContainer.textContent.slice(0, at.startOffset)}</span>`;
    //               init++;
    //             }
    //             //问题元素的text与class与定位
    //             el.innerHTML += i.textContent;
    //             el.classList.add('xiziItem');
    //             //删除问题元素
    //           }
    //           if (init !== 0) {
    //             el.style.left = rect[index].left > 0 ? rect[index].left + 'px' : 0;
    //           }
    //           el.style.top = rect[index].top + document.documentElement.scrollTop + 'px';
    //           el.onclick = removeEl;
    //           //元素的戳
    //           time = 'xizi' + new Date().getTime();
    //           el.id = time;
    //           localforage.setItem(time, {
    //             val: i.textContent,
    //             url: at.commonAncestorContainer.baseURI,
    //             x: init !== 0 ? rect[index].left > 0 ? rect[index].left : 0 + 'px' : 0,
    //             y: rect[index].top + document.documentElement.scrollTop + 'px',
    //             width: rect[index].width + 'px',
    //             isA: a,
    //             check: 0,
    //             isCode: false,
    //             html: el.outerHTML
    //           })
    //         }
    //       }
    //     }
    //     sl.removeAllRanges();
    //   }
    // }
  
    // function articleMouseUp(evt) {
    //   let sl = window.getSelection();
    //   let str = sl.toString().replace(/\s/g, "");
    //   if (str) {
    //     let at = sl.getRangeAt(0);//range对象
    //     let el, time;
    //     let content = sl.getRangeAt(0).cloneContents();
    //     let rect = at.getClientRects();//选中区域的rect集合
    //     //是否为answer==>创建input/textarea或span/code并绑定单击/双击事件以及不同类名和宽度
    //     if (at.commonAncestorContainer.nodeName === 'CODE') {
    //       let code;
    //       if (a) {
    //         code = document.createElement('textarea');
    //         code.classList.add('xiziTextarea');
    //         code.answer = str;
    //         code.style.width = at.commonAncestorContainer.offsetWidth + 'px';
    //         //textarea高度自适应
    //         code.onkeyup = function (evt) {
    //           evt.target.style.height = evt.target.scrollHeight + 'px';
    //         }
    //         code.onchange = handleInput;
    //       } else {
    //         code = at.commonAncestorContainer.cloneNode(false);
    //         code.classList.add('xiziItem');
    //         code.classList.add('xiziCode');
    //         code.appendChild(content);
    //       }
    //       code.onclick = removeEl;
    //       div.appendChild(code);
    //       code.style.left = rect[0].left > 0 ? rect[0].left : 0 + 'px';
    //       code.style.top = rect[0].top + document.documentElement.scrollTop + 'px';
    //       //元素的戳
    //       time = 'xizi' + new Date().getTime();
    //       code.id = time;
    //       localforage.setItem(time, {
    //         val: str,
    //         url: at.commonAncestorContainer.baseURI,
    //         x: rect[0].left > 0 ? rect[0].left : 0 + 'px',
    //         y: rect[0].top + document.documentElement.scrollTop + 'px',
    //         width: at.commonAncestorContainer.offsetWidth + 'px',
    //         isA: a,
    //         check: 0,
    //         isCode: true,
    //         html: code.outerHTML
    //       })
    //     } else {
    //       //纯文字的元素
    //       el = document.createElement('div');
    //       let indexof = at.commonAncestorContainer.nodeName !== '#text' ? at.commonAncestorContainer.innerText.indexOf(str):at.commonAncestorContainer.parentElement.innerText.indexOf(str);
    //       console.log(str);
    //       el.innerHTML = `<span style="opacity:0;">${at.commonAncestorContainer.textContent.slice(0, indexof !== -1 ? indexof : 0)}</span>`;
    //       el.appendChild(content);
    //       el.classList.add('xiziItem');
    //       el.onclick = removeEl;
    //       el.style.top = rect[0].top + document.documentElement.scrollTop + 'px';
    //       div.appendChild(el);
    //     }
    //     sl.removeAllRanges();
    //   }
    // }
  
    //选中区块的rect创建框框/resize失败
    // function articleMouseUp() {
    //   var rects = window.getSelection().getRangeAt(0).getClientRects();
    //   for (var i = 0; i != rects.length; i++) {
    //     var rect = rects[i];
    //     var tableRectDiv = document.createElement('div');
    //     tableRectDiv.style.position = 'absolute';
    //     tableRectDiv.style.border = '1px solid red';
    //     var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    //     var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    //     tableRectDiv.style.margin = tableRectDiv.style.padding = '0';
    //     tableRectDiv.style.top = (rect.top + scrollTop) + 'px';
    //     tableRectDiv.style.left = (rect.left + scrollLeft) + 'px';
    //     tableRectDiv.style.width = (rect.width - 2) + 'px';
    //     tableRectDiv.style.height = (rect.height - 2) + 'px';
    //     div.appendChild(tableRectDiv);
    //   }
    // }
  */
  //根据article的直系子元素进行定位与内容填充
  //鼠标开始选择的时候记下其target用以定位top值，再找到内容在元素中的index，创造新元素，填充透明的（元素中选中之前的）文字，再绑定事件存入数据库等
  //优点在于解决了之前文字元素不能成为一个段落的问题，缺点在于使用index因此在同一段落中有相同内容的文字会优先前面的
  function articleMouseUp() {
    let sl = window.getSelection();
    let str = sl.toString().replace(/\s/g, "");
    if (str) {
      let at = sl.getRangeAt(0);//range对象
      let el, time, indexof;
      let content = sl.getRangeAt(0).cloneContents();
      let rect = at.getClientRects();//选中区域的rect集合
      time = 'xizi' + new Date().getTime();
      el = document.createElement('div');
      indexof = at.commonAncestorContainer !== article ? current_target.innerText.indexOf(content.textContent) : current_target.innerText.indexOf(content.childNodes[0].textContent);
      if (a) {
        //以下是答案
        if (current_target.nodeName !== 'PRE') {
          el.innerHTML = `<span style="opacity:0;">${current_target.innerText.slice(0, indexof)}</span><span class="xiziInputHide">${content.textContent}</span>`;
          let input = document.createElement('span');
          input.classList.add('xiziInputShow');
          el.appendChild(input);
          div.appendChild(el);
          input.style.left = el.childNodes[1].offsetLeft + 5 + 'px';
          //加一个空格，否则contentEditable不起作用
          input.innerHTML = "&nbsp;";
          input.contentEditable = true;
          input.oninput = handleInput;
          input.onblur = handleBlur;
          input.id = time;
          input.answer = str;
        } else {
          let code = document.createElement('textarea');
          code.classList.add('xiziTextarea');
          code.answer = str;
          //textarea高度自适应
          code.onkeyup = function (evt) {
            if (evt.target.scrollTop > 0) evt.target.style.height = evt.target.scrollHeight + "px";
          }
          code.oninput = handleInput;
          code.onblur = handleBlur;
          code.id = time;
          el.appendChild(code);
          div.appendChild(el);
          el.style.width = code.offsetWidth + 'px';
          el.style.height = code.offsetHeight + 'px';
        }
      } else {
        //以下是问题
        if (at.commonAncestorContainer !== article) {
          let node = current_target.cloneNode(false);
          node.appendChild(content);
          node.innerHTML = `<span style="opacity:0;">${current_target.innerText.slice(0, indexof)}</span>${node.innerHTML}`;
          el.appendChild(node);
        } else {
          content.childNodes[0].innerHTML = `<span style="opacity:0;">${current_target.innerText.slice(0, indexof)}</span>${content.childNodes[0].innerHTML}`;
          el.appendChild(content);
        }
        div.appendChild(el);
      }
      el.classList.add('xiziItem');
      el.id = time;
      el.onclick = removeEl;
      let paddingTop = getComputedStyle(current_target, null)['paddingTop'];
      el.style.top = current_target.offsetTop + (paddingTop.slice(0, paddingTop.indexOf('px')) * 1) + 'px';
      sl.removeAllRanges();
      localforage.setItem(time, {
        val: str,
        url: at.commonAncestorContainer.baseURI,
        isA: a,
        check: 0,
        html: el.outerHTML
      });
      sendToBg({ key: time, obj: { val: str, url: at.commonAncestorContainer.baseURI, check: 0 } });
    }
  }
  //鼠标刚开始选中时，记住其target
  function articleMouseDown(evt) {
    cur = evt.target;
    while (cur.parentNode !== article) {
      cur = cur.parentNode;
    }
    current_target = cur;
  }
  /*
    // function handleInput(evt) {
    //   //检查答案
    //   let target = evt.target;
    //   if (target.value.replace(/\s/g, "") === target.answer) {
    //     target.classList.add('xiziAnswerRight');
    //     target.readonly = true;
    //     localforage.getItem(target.id).then(val => {
    //       val.check++;
    //       localforage.setItem(target.id, val);
    //     });
    //     current_count++;
    //     count.innerHTML = current_count;
    //   }
    // }
  */
  //答案input事件
  function handleInput(evt) {
    //检查答案
    let target = evt.target;
    let isInput = target.nodeName === 'TEXTAREA';
    if (isInput ? target.value.replace(/\s/g, "") === target.answer : target.innerText.replace(/\s/g, "") === target.answer) {
      target.classList.add('xiziAnswerRight');
      target.contentEditable = false;
      target.readOnly = true;
      target.style.backGround = isInput ? "#fff" : "#ff0";
      localforage.getItem(target.id).then(val => {
        val.check++;
        localforage.setItem(target.id, val);
        sendToBg({ key: target.id, obj: val });
      });
      current_count++;
      count.innerHTML = current_count;
    }
  }
  //答案失去焦点事件
  function handleBlur(evt) {
    let target = evt.target;
    target.contentEditable = false;
    target.readOnly = true;
  }

  //父元素append自定义元素
  function element(el, type, str, foo) {
    let btn = document.createElement(type);
    btn.innerText = str;
    btn.onclick = foo ? foo : null;
    return el.appendChild(btn)
  }
  //克隆元素
  function cloneNode(el) {
    if (el !== article && el !== wrap) {
      let node = el.cloneNode(false);
      node.classList.add('xiziItem');
      return div.appendChild(node);
    } else {
      let span = document.createElement('span');
      span.classList.add('xiziItem');
      return div.appendChild(span);
    }
  }
  //查找文章元素路径函数
  function findFather(el) {
    let matched = [];
    let child = el;
    while (child.nodeName !== "HTML" && child.parentNode !== null) {
      for (let index in child.parentNode.children) {
        if (child.parentNode.children[index] === child) {
          matched.push(index)
        }
      }
      child = child.parentNode;
    }
    let str = "document.body"
    for (let i = matched.length - 2; i >= 0; i--) {
      str += `.children[${matched[i].substr(-1, 1)}]`
    }
    return str
  }

  //弹出框
  function popup(str) {
    console.log(str);
  }
})(this)