var jdoc={};
jdoc.file="";

jdoc.Document=function(){
  var Document = document.createElement('div');
  Document.className = "document";
  jdoc.document = Document;
  return Document;
}

jdoc.load = function(){
  if (localStorage && localStorage.document){
    jdoc.currentPage.content.innerHTML = localStorage.document;
  }
}

jdoc.newPage=function(startOffset){
  if (!startOffset) startOffset = 0;
  var Page = document.createElement('div');
  Page.className = "page";

  var Margins = document.createElement('div');
  Margins.className = "margins";
  Margins.contentEditable = true;
  Page.appendChild(Margins);
  Page.focus = function(){
    Margins.contentEditable = true;
    Margins.click();
    Margins.focus();
    jdoc.currentPage.blur();
    jdoc.currentPage = Page;
    //Page.scrollIntoView(false);
  }
  Page.blur = function(){
    Margins.blur();
  }

  jdoc.document.appendChild(Page);
  jdoc.currentPage = Page;
  jdoc.currentPage.content = Margins;
  Page.scrollIntoView(true);
  window.scrollBy(0,-50);
  events.clickFocus(Page);
  Margins.innerHTML= jdoc.file.substring(startOffset,jdoc.file.length);
  window.addEventListener ("keydown", function (e) {    
    if ((e.keyIdentifier == 'U+0055'|| e.keyCode == 85) && e.ctrlKey){
      document.execCommand("underline",false,null);
      e.preventDefault();
      e.stopPropagation();
      return false;

    }
    if ((e.keyIdentifier == 'U+0042'|| e.keyCode == 66) && e.ctrlKey){
      document.execCommand("Bold", false, null);
      //jdoc.stylize('<b>','</b>',true);
      e.preventDefault();
      e.stopPropagation();
      return false;

    }

    if ((e.keyIdentifier == 'U+0049'|| e.keyCode == 73) && e.ctrlKey){
      document.execCommand("Italic", false, null);
      //jdoc.stylize('<i>','</i>',true);
      e.preventDefault();
      e.stopPropagation();

    }else
    if (e.keyIdentifier == 'U+0009' || e.keyCode == 9){
      jdoc.indent();
      e.preventDefault();
      e.stopPropagation();

    } else
    if (e.keyIdentifier == 'Enter'|| e.keyCode == 13){
      jdoc.stylize('<br />','', true);
      jdoc.lastWord = '<br />';
      e.preventDefault();
      e.stopPropagation();
    }
    if (Margins.offsetHeight > Page.clientHeight){
      var i;
      var offset=0;
      for (i = Margins.innerHTML.length; i > 0; i--){
        // find a space
        if(Margins.innerHTML.substr(i,i).match(/^(\s)|(<br\s?>)/)) break;
        offset ++;
        console.log(Margins.innerHTML.substr(i,1))
      }
      console.log(Margins.innerHTML.substring(i+1,Margins.innerHTML.length));
      events.input(Margins.innerHTML);
      Margins.innerHTML = Margins.innerHTML.substring(0,i);
      console.log(jdoc.file.substring(jdoc.file.length-offset, jdoc.file.length));
      jdoc.newPage(jdoc.file.length - offset);
    } else {
      events.input(Margins.innerHTML);
    }

  });
}




jdoc.stylize = function (start,end,selectPastedContent) {
    var sel, range, text;
    text = "";
    if (!end){
      end = "";
    }
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.startOffset != range.endOffset){
              text = range.endContainer.data.substring(range.startOffset,range.endOffset);
              console.log(text);
            } else {
              selectPastedContent = false;
            }
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = start + text + end;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            var firstNode = frag.firstChild;
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                if (selectPastedContent) {
                    range.setStartBefore(firstNode);
                } else {
                    range.collapse(true);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        // IE < 9
        var originalRange = sel.createRange();
        originalRange.collapse(true);
        sel.createRange().pasteHTML(start + text + end);
        var range = sel.createRange();
        range.setEndPoint("StartToStart", originalRange);
        range.select();
    }
}

jdoc.indent = function(){
  console.log('indent');
  //jdoc.stylize('<span class="margin-indent"> ','</span>',true)
  jdoc.stylize('<span class="indent"> ','</span>',true);
}

jdoc.overflow = function(e){
  console.log(e);
  if (e.type=='overflow' || ('verticalOverflow' in e && e.verticalOverflow)){
    old = jdoc.currentPage;
    old_html = old.content.innerHTML;
    jdoc.newPage();
    console.log(old_html.substr(0, old_html.length - jdoc.lastWord.length))
    old.content.innerHTML = old_html.substr(0, old_html.length - jdoc.lastWord.length);
    jdoc.currentPage.focus();
    jdoc.currentPage.content.innerHTML = jdoc.lastWord;
  }
}
jdoc.fileButton = function(element){
  var Input = document.createElement('input');
  Input.type="file";
  element.appendChild(Input);
  Input.addEventListener('change', jdoc.loadFile, false);
}

jdoc.loadFile = function(e){
  console.log(e);
  var files = e.target.files;
  console.log(files);
  var reader = new FileReader();
  reader.onload = (function(theFile) {
    return function(e) {
      jdoc.file = e.target.result;
      jdoc.currentPage.content.innerHTML = jdoc.file;
    }
  })(files[0]);
  reader.readAsText(files[0]);

}

