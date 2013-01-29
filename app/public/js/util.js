// util.js 
(function(exports){ 

/** 
* 移除字符串两端的空白字符 
* 
* @return {String} 
* @api public 
*/ 
String.prototype.trim = function(){ 
return this.replace(/(^\s*)|(\s*$)/g, ""); 
}; 

/** 
* 判断是否自定类型的文件 
* 
* @param {String}filename 
* @param {String}types, 多个类型使用,号分隔，如 doc,docx,txt 
* @return {Boolean} true or false 
* @api public 
*/ 
var is_filetype = exports.is_filetype = function(filename, types) { 
types = types.split(','); 
var pattern = '\.('; 
for(var i=0; i<types.length; i++) { 
if(0 != i) { 
pattern += '|'; 
} 
pattern += types[i].trim(); 
} 
pattern += ')$'; 
return new RegExp(pattern, 'i').test(filename); 
}; 

})( (function(){ 
if(typeof exports === 'undefined') { 
window.util = {}; 
return window.util; 
} else { 
return exports; 
} 
})() ); 
	function check_type(){
		if(!util.is_filetype($('#upload').val(), constant.RESUME_FILETYPES)){ 
			can_submit = false; // 不允许上传 
			$('#upload').val(''); 
			alert('请选择上传文件，并且只允许上传格式为: ' + constant.RESUME_FILETYPES + '的文件！'); 
		return false;
		} 
	return true;
	}
