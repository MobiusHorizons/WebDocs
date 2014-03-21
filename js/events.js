var events = {};

events.setPageOverflow = function(){
  var el = jdoc.currentPage.content;
    el.addEventListener ("overflowchanged", jdoc.overflow,false);
    console.log('listener set');
//  console.log ('overflow' in window);
//    el.addEventListener('overflow',jdoc.overflow,false);
//    console.log('listener set');

}

events.clickFocus = function(element){
  element.addEventListener ("click", element.focus() ,false);
}

events.input = function(content){
  if (content.oldLength && (content.length > content.oldLength)){
    jdoc.file += content.substring(content.oldLength,content.length);
  } else if (!content.oldLength){
    jdoc.file += content;
  }
  content.oldLength = content.length;
}
