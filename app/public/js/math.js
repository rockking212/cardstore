/** 
* 购物车加减按钮 
* @param txt_id 数量的ID 
* @param type 加 + 减 - 
* @param num 添加或者减少的数量 默认为一 
*/
functioncart_number(txt_id, type, num) 
{ 
num = num || 1; 
vartxt = document.getElementById(txt_id); 
varsource_num = parseInt(txt.value); 
if(source_num == 1 && type == '-') 
{ 
alert('请最少购买一个商品'); 
return; 
} 
varto_num = source_num; 
if(type == '+') 
{ 
to_num += num; 
} 
elseif(type == '-') 
{ 
to_num -= num; 
} 
 
txt.value = to_num; 
showdiv(txt); 
}
