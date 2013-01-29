// constant.js 
(function(exports){ 

exports.RESUME_FILETYPES = 'bmp,png,gif,jpg'; 

})( (function(){ 
if(typeof exports === 'undefined') { 
window.constant = {}; 
return window.constant; 
} else { 
return exports; 
} 
})() ); 

